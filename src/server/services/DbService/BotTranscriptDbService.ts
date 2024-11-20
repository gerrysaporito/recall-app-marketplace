import type { BotTranscript, Prisma } from "@prisma/client";
import cuid from "cuid";
import { z } from "zod";
import { prisma } from "@/config/prisma";
import { BotTranscriptSchema } from "@/lib/schemas/BotTranscriptSchema";

const WriteBotTranscriptSchema = BotTranscriptSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

const ReadBotTranscriptSchema = BotTranscriptSchema;

const CreateBotTranscriptSchema = z.object({
  botTranscriptId: z.string().optional(),
  botTranscriptArgs: WriteBotTranscriptSchema,
});

const CreateBotTranscriptBatchSchema = z.object({
  botId: z.string(),
  recordingId: z.string(),
  words: z.array(
    z.object({
      speakerId: z.string(),
      speakerName: z.string().nullish(),
      word: z.string(),
      startTime: z.number(),
      endTime: z.number(),
      confidence: z.number(),
    })
  ),
});

export const BotTranscriptFiltersSchema = z.object({
  botId: z.string().optional(),
  recordingId: z.string().optional(),
  speakerId: z.string().optional(),
  speakerName: z.string().optional(),
  startTime: z.number().optional(),
  endTime: z.number().optional(),
});
export type BotTranscriptFilterType = z.infer<
  typeof BotTranscriptFiltersSchema
>;

export const SearchBotTranscriptsSchema = z.object({
  filters: BotTranscriptFiltersSchema,
  page: z.number().min(1),
  itemsPerPage: z.number().min(1),
});
export type SearchBotTranscriptsType = z.infer<
  typeof SearchBotTranscriptsSchema
>;

export const BotTranscriptDbService = {
  _parseModel: (args: {
    model: BotTranscript;
  }): z.infer<typeof ReadBotTranscriptSchema> => {
    const { model } = args;
    return ReadBotTranscriptSchema.parse({
      ...model,
    } satisfies z.input<typeof ReadBotTranscriptSchema>);
  },

  createBotTranscripts: async function (
    args: z.infer<typeof CreateBotTranscriptBatchSchema>
  ): Promise<{ botTranscripts: z.infer<typeof ReadBotTranscriptSchema>[] }> {
    const { botId, recordingId, words } =
      CreateBotTranscriptBatchSchema.parse(args);

    const botTranscripts = await prisma.$transaction(async (tx) => {
      const createdTranscripts = await Promise.all(
        words.map((word) =>
          tx.botTranscript.create({
            data: {
              id: `botTranscript_${cuid()}`,
              botId,
              recordingId,
              ...word,
            },
          })
        )
      );
      return createdTranscripts;
    });

    const results = botTranscripts.map((transcript) =>
      this._parseModel({ model: transcript })
    );
    return { botTranscripts: results };
  },

  createBotTranscript: async function (
    args: z.infer<typeof CreateBotTranscriptSchema>
  ): Promise<{ botTranscript: z.infer<typeof ReadBotTranscriptSchema> }> {
    const { botTranscriptId, botTranscriptArgs } =
      CreateBotTranscriptSchema.parse(args);

    const botTranscript = await prisma.botTranscript.create({
      data: {
        id: botTranscriptId ?? `botTranscript_${cuid()}`,
        ...botTranscriptArgs,
      },
    });

    const result = this._parseModel({ model: botTranscript });
    return { botTranscript: result };
  },

  getBotTranscriptById: async function (args: {
    botTranscriptId: string;
  }): Promise<{
    botTranscript: z.infer<typeof ReadBotTranscriptSchema> | null;
  }> {
    const { botTranscriptId } = z
      .object({ botTranscriptId: z.string() })
      .parse(args);

    const botTranscript = await prisma.botTranscript.findUnique({
      where: { id: botTranscriptId, deletedAt: null },
    });

    if (!botTranscript) {
      return { botTranscript: null };
    }

    const result = this._parseModel({ model: botTranscript });
    return { botTranscript: result };
  },

  searchBotTranscripts: async function (
    args: z.infer<typeof SearchBotTranscriptsSchema>
  ): Promise<{
    botTranscripts: z.infer<typeof ReadBotTranscriptSchema>[];
    totalCount: number;
  }> {
    const { filters, page, itemsPerPage } =
      SearchBotTranscriptsSchema.parse(args);

    const where: Prisma.BotTranscriptWhereInput = {
      ...(filters.botId && { botId: filters.botId }),
      ...(filters.recordingId && { recordingId: filters.recordingId }),
      ...(filters.speakerId && { speakerId: filters.speakerId }),
      ...(filters.speakerName && { speakerName: filters.speakerName }),
      ...(filters.startTime && { startTime: { gte: filters.startTime } }),
      ...(filters.endTime && { endTime: { lte: filters.endTime } }),
      deletedAt: null,
    };

    const [botTranscripts, totalCount] = await Promise.all([
      prisma.botTranscript.findMany({
        where,
        skip: (page - 1) * itemsPerPage,
        take: itemsPerPage,
        orderBy: { startTime: "asc" },
      }),
      prisma.botTranscript.count({ where }),
    ]);

    const results = botTranscripts.map((botTranscript) =>
      this._parseModel({ model: botTranscript })
    );
    return { botTranscripts: results, totalCount };
  },
};
