/*
  Warnings:

  - You are about to drop the column `args` on the `BotTriggerEvent` table. All the data in the column will be lost.
  - Added the required column `name` to the `Bot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Bot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `actionName` to the `BotTriggerEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `botId` to the `BotTriggerEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `botTemplateAppId` to the `BotTriggerEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `data` to the `BotTriggerEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recordingId` to the `BotTriggerEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `speakerId` to the `BotTriggerEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `triggerEventId` to the `BotTriggerEvent` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "BotTranscript" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recordingId" TEXT NOT NULL,
    "speakerName" TEXT,
    "speakerId" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "startTime" INTEGER NOT NULL,
    "endTime" INTEGER NOT NULL,
    "confidence" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    "botId" TEXT NOT NULL,
    CONSTRAINT "BotTranscript_botId_fkey" FOREIGN KEY ("botId") REFERENCES "Bot" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Bot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "meetingUrl" TEXT NOT NULL,
    "recallBotId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    "botTemplateId" TEXT NOT NULL,
    CONSTRAINT "Bot_botTemplateId_fkey" FOREIGN KEY ("botTemplateId") REFERENCES "BotTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Bot" ("botTemplateId", "id", "meetingUrl", "recallBotId") SELECT "botTemplateId", "id", "meetingUrl", "recallBotId" FROM "Bot";
DROP TABLE "Bot";
ALTER TABLE "new_Bot" RENAME TO "Bot";
CREATE TABLE "new_BotTriggerEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "actionName" TEXT NOT NULL,
    "triggerEventId" TEXT NOT NULL,
    "recordingId" TEXT NOT NULL,
    "speakerName" TEXT,
    "speakerId" TEXT NOT NULL,
    "recallBotId" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    "botId" TEXT NOT NULL,
    "botTemplateAppId" TEXT NOT NULL,
    CONSTRAINT "BotTriggerEvent_botId_fkey" FOREIGN KEY ("botId") REFERENCES "Bot" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BotTriggerEvent_botTemplateAppId_fkey" FOREIGN KEY ("botTemplateAppId") REFERENCES "BotTemplateApp" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_BotTriggerEvent" ("createdAt", "deletedAt", "id", "recallBotId", "updatedAt") SELECT "createdAt", "deletedAt", "id", "recallBotId", "updatedAt" FROM "BotTriggerEvent";
DROP TABLE "BotTriggerEvent";
ALTER TABLE "new_BotTriggerEvent" RENAME TO "BotTriggerEvent";
CREATE UNIQUE INDEX "BotTriggerEvent_triggerEventId_key" ON "BotTriggerEvent"("triggerEventId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
