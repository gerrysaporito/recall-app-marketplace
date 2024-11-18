import { deepMerge } from '@/lib/object';
import type { DeepPartial } from '@/types/generics';
import { isLocalEnv } from '@/lib/env';

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LogContext {
  // Unique identifier for the request
  traceId: string;
  // Unique sub-identifier for the current group of logs
  spanId: string;
  // Unique identifier for the team
  teamId?: string;
  // Unique identifier for the account
  accountId?: string;
  // Unique identifier for the API key
  apiKeyId?: string;
  // Additional custom context
  [key: string]: any;
}

export type LogOptions<T extends LogLevel> = {
  level: T;
  message: string;
  context?: DeepPartial<LogContext>;
  metadata?: Record<string, any>;
} & (T extends 'error' ? { error: Error } : { error?: Error });

export class BaseLogger {
  constructor(protected _context: LogContext & { service: string }) {}

  get context(): LogContext {
    return this._context;
  }

  protected log<T extends LogLevel>(options: LogOptions<T>): void {
    const { level, message, context, metadata, error } = options;
    const timestamp = new Date().toISOString();

    const logEntry = deepMerge({
      obj1: {
        ...this._context,
      },
      obj2: {
        ...context,
        ...(error && { error: this.formatError(error) }),
        timestamp,
        level,
        message,
        metadata,
      },
    });

    // Log as JSON for easy parsing by log management tools
    console.info(JSON.stringify(logEntry));
  }

  private formatError(error: Error): object {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  public info(args: {
    message: string;
    context?: DeepPartial<LogContext>;
    metadata?: Record<string, any>;
  }) {
    this.log({ level: 'info', ...args });
  }

  public warn(args: {
    message: string;
    context?: DeepPartial<LogContext>;
    metadata?: Record<string, any>;
  }) {
    this.log({ level: 'warn', ...args });
  }

  public error(args: {
    message: string;
    error: Error;
    context?: DeepPartial<LogContext>;
    metadata?: Record<string, any>;
  }) {
    this.log({ level: 'error', ...args });
  }

  public debug(args: {
    message: string;
    context?: DeepPartial<LogContext>;
    metadata?: Record<string, any>;
  }) {
    if (isLocalEnv) {
      this.log({ level: 'debug', ...args });
    }
  }

  public cloudLog(args: {
    message: string;
    context?: DeepPartial<LogContext>;
    metadata?: Record<string, any>;
  }) {
    if (!isLocalEnv) {
      this.log({ level: 'debug', ...args });
    }
  }

  public updateSpan(spanId: string): BaseLogger {
    this._context = {
      ...this._context,
      spanId,
    };
    return this;
  }

  public updateContext(context: DeepPartial<LogContext>): BaseLogger {
    this._context = {
      ...this._context,
      ...context,
    };
    return this;
  }
}
