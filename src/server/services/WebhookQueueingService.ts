import type { Job, Queue, Worker } from "bullmq";
import { WebhookEventSchema } from "@/lib/schemas/WebhookEventSchema";
import { z } from "zod";
import { redis } from "@/config/redis";
import { DbService } from "@/server/services/DbService";
import { QueueLogger } from "@/server/services/LoggerService/QueueLogger";
import { WebhookEventType } from "@/lib/constants/WebhookEventType";
import { WebhookEventStatus } from "@/lib/constants/WebhookEventStatus";

const EnqueueJobHandlerArgsSchema = z.object({
  webhookEventId: z.string(),
  webhookId: z.string(),
  type: z.nativeEnum(WebhookEventType),
  userId: z.string(),
  data: z.any(),
  logger: z.any().refine((data) => !!data, "Logger is required"),
});

class WebhookQueueingClass {
  queue: Queue<z.infer<typeof EnqueueJobHandlerArgsSchema>> | undefined;
  worker: Worker<z.infer<typeof EnqueueJobHandlerArgsSchema>> | undefined;
  backoffAttempts = 5;
  private initialized = false;

  constructor() {
    void this.initialize().catch(console.error);
  }

  async initialize() {
    if (this.initialized) return;

    const { Queue, Worker } = await import("bullmq");

    const queueName = this.queueName();
    this.queue = new Queue(queueName, {
      connection: redis,
    });
    this.worker = new Worker(queueName, this.enqueueJobHandler, {
      connection: redis,
      concurrency: 1,
      limiter: {
        max: 1,
        duration: 1000, // Milliseconds
      },
    });

    this.worker.on("completed", (job) => {
      console.info(`Job ${job.id} completed`);
    });

    this.worker.on("failed", (job, err) => {
      console.error(`Job ${job?.id} failed:`, err);
    });

    this.initialized = true;
  }

  queueName = () => {
    return `webhook-queue`;
  };

  jobName = (args: { webhookId: string; type: WebhookEventType }) => {
    const { webhookId, type } = args;
    const timestamp = new Date().getTime();
    return `webhook-job:${webhookId}:${type}:${timestamp}`;
  };

  backoffDelay = () => 1000 + Math.round(Math.random() * 1000);

  formatErrorMessage = (args: {
    webhookId: string;
    errorMessage: string;
  }): string => {
    const { webhookId, errorMessage } = args;
    return `WebhookWorkerHandler (${webhookId}): ${errorMessage}`;
  };

  enqueueJob = async (
    args: z.infer<typeof EnqueueJobHandlerArgsSchema>
  ): Promise<{ job: Job<z.infer<typeof EnqueueJobHandlerArgsSchema>> }> => {
    const { webhookId, logger, ...data } =
      EnqueueJobHandlerArgsSchema.parse(args);
    const queueLogger = new QueueLogger({
      ...logger.context,
      spanId: "enqueueWebhookJob",
    });

    queueLogger.info({
      message: "Initiating webhook jobs",
      metadata: { userId: data.userId, type: data.type },
    });

    // Create the webhook event with "pending" status
    const { webhookEvent } =
      await DbService.webhook.webhookEvent.createWebhookEvent({
        webhookEventArgs: {
          ...data,
          webhookId,
          status: WebhookEventStatus.pending,
          retryCount: 0,
        },
      });

    queueLogger.info({
      message: "Adding job to queue",
      metadata: { webhookId, webhookEventId: webhookEvent.id },
    });

    const job = await this.queue?.add(
      this.jobName({ webhookId, type: data.type }),
      {
        ...data,
        webhookId,
        webhookEventId: webhookEvent.id,
        logger: queueLogger,
      } satisfies z.input<typeof EnqueueJobHandlerArgsSchema>,
      {
        attempts: this.backoffAttempts,
        backoff: {
          type: "exponential",
          delay: this.backoffDelay(),
        },
      }
    );
    if (!job) {
      throw new Error("Failed to enqueue webhook job");
    }

    queueLogger.info({
      message: "Webhook jobs enqueued",
      metadata: { jobCount: 1 },
    });
    return { job };
  };

  enqueueJobHandler = async (
    job: Job<z.infer<typeof EnqueueJobHandlerArgsSchema>>
  ): Promise<{ webhookEvent: z.infer<typeof WebhookEventSchema> | null }> => {
    const result = EnqueueJobHandlerArgsSchema.safeParse(
      job.data satisfies z.input<typeof EnqueueJobHandlerArgsSchema>
    );
    if (!result.success) {
      console.error("Failed to parse job data", result.error);
      return { webhookEvent: null };
    }
    const {
      webhookId,
      webhookEventId,
      userId,
      type,
      data,
      logger: rawLogger,
    } = result.data;
    const logger = new QueueLogger({
      ...rawLogger.context,
    });

    logger.info({
      message: "Starting to process webhook job",
      metadata: {
        jobId: job.id,
        webhookId,
        userId,
        webhookEventId,
        attemptNumber: job.attemptsMade + 1,
      },
    });

    if (job.attemptsMade > 0) {
      logger.info({
        message: "Retrying webhook request",
        metadata: {
          webhookId,
          webhookEventId,
          userId,
          attemptNumber: job.attemptsMade + 1,
          maxAttempts: this.backoffAttempts,
        },
      });
    }

    // Update webhook event status to "sending"
    await this.updateWebhookEventStatus(
      webhookEventId,
      WebhookEventStatus.sending
    );

    // Get the webhook
    const { webhook } = await DbService.webhook.getWebhookById({
      webhookId,
    });

    // Validate the webhook event should be emitted
    if (!webhook) {
      const failureReason = `Webhook with ID ${webhookId} not found`;
      await this.updateWebhookEventFailure(webhookEventId, failureReason);
      logger.error({
        message: "Webhook not found",
        error: new Error(failureReason),
        metadata: { webhookId, webhookEventId },
      });
      return { webhookEvent: null };
    }
    if (webhook.userId !== userId) {
      const failureReason = `Webhook with ID ${webhookId} does not belong to user ${userId}`;
      await this.updateWebhookEventFailure(webhookEventId, failureReason);
      logger.error({
        message: "Webhook team mismatch",
        error: new Error(failureReason),
        metadata: { webhookId, userId, webhookEventId },
      });
      return { webhookEvent: null };
    }

    // Send the webhook event to the team's webhook url
    const requestBody = {
      webhookId: webhook.id,
      webhookEventId,
      type,
      data,
    };

    const url = new URL(webhook.url);
    if (url.protocol !== "https:") {
      const failureReason = `Webhook with ID ${webhookId} is not using HTTPS`;
      await this.updateWebhookEventFailure(webhookEventId, failureReason);
      logger.error({
        message: "Insecure webhook URL",
        error: new Error(failureReason),
        metadata: { webhookId, url: webhook.url, webhookEventId },
      });
      return { webhookEvent: null };
    }

    logger.info({
      message: "Sending webhook request",
      metadata: { webhookId, url: webhook.url, webhookEventId },
    });

    const requestSentAt = new Date();
    let response: Response;
    try {
      response = await fetch(url, {
        method: "POST",
        headers: {
          redirect: "manual",
          "Content-Type": "application/json",
          "X-Timestamp": requestSentAt.toISOString(),
        },
        body: JSON.stringify(requestBody),
      });
    } catch (error: any) {
      const failureReason = `Failed to send webhook request: ${error.message}`;
      await this.updateWebhookEventFailure(webhookEventId, failureReason);
      logger.error({
        message: "Webhook request failed",
        error: error,
        metadata: { webhookId, url: webhook.url, webhookEventId },
      });
      return { webhookEvent: null };
    }

    const responseReceivedAt = new Date();
    const responseTime = responseReceivedAt.getTime() - requestSentAt.getTime();

    logger.info({
      message: "Webhook response received",
      metadata: {
        webhookId,
        status: response.status,
        webhookEventId,
        responseTime,
      },
    });

    // Update the webhook event with the response
    let responseBody;
    let responseText;
    try {
      responseText = await response.text();
      responseBody = JSON.parse(responseText);
    } catch (error) {
      logger.error({
        message: "Failed to parse response body as JSON",
        error: new Error("Failed to parse response body as JSON"),
        metadata: {
          webhookId,
          responseText,
          webhookEventId,
        },
      });
    }

    const status = response.ok
      ? WebhookEventStatus.completed
      : WebhookEventStatus.failed;
    const failureReason = !response.ok
      ? `Webhook request failed with status ${response.status}`
      : null;

    const { webhookEvent: updatedWebhookEvent } =
      await DbService.webhook.webhookEvent.updateWebhookEvent({
        webhookEventId,
        webhookEventArgs: {
          responseStatus: response.status,
          responseBody,
          status,
          failureReason,
          requestSentAt,
          responseReceivedAt,
          retryCount: job.attemptsMade,
          lastRetryAt: job.attemptsMade > 0 ? new Date() : null,
        },
      });

    if (failureReason) {
      logger.error({
        message: "Webhook request failed with non-2xx status",
        error: new Error(failureReason),
        metadata: {
          webhookId,
          webhookEventId: updatedWebhookEvent.id,
          status: response.status,
          responseBody,
          responseTime,
        },
      });
    } else {
      logger.info({
        message: "Webhook event completed successfully",
        metadata: {
          webhookId,
          webhookEventId: updatedWebhookEvent.id,
          status: response.status,
          responseTime,
        },
      });
    }

    if (!updatedWebhookEvent) {
      throw new Error("Webhook event not found after update");
    }

    return { webhookEvent: updatedWebhookEvent };
  };

  private async updateWebhookEventStatus(
    webhookEventId: string,
    status: WebhookEventStatus
  ) {
    await DbService.webhook.webhookEvent.updateWebhookEvent({
      webhookEventId,
      webhookEventArgs: { status },
    });
  }

  private async updateWebhookEventFailure(
    webhookEventId: string,
    failureReason: string
  ) {
    await DbService.webhook.webhookEvent.updateWebhookEvent({
      webhookEventId,
      webhookEventArgs: {
        status: WebhookEventStatus.failed,
        failureReason,
      },
    });
  }
}

const getWebhookQueue = (): WebhookQueueingClass => {
  if (!global?.queues?.webhook) {
    const queueingService = new WebhookQueueingClass();
    if (!global?.queues) {
      global.queues = { ...global.queues, webhook: queueingService };
    } else {
      global.queues.webhook = queueingService;
    }
  }
  return global.queues.webhook;
};

export const WebhookQueueingService = getWebhookQueue();
