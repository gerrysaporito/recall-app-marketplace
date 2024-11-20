/*
  Warnings:

  - A unique constraint covering the columns `[triggerEventId,speakerId,recordingId,botId]` on the table `BotTriggerEvent` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "BotTriggerEvent_triggerEventId_key";

-- CreateIndex
CREATE UNIQUE INDEX "BotTriggerEvent_triggerEventId_speakerId_recordingId_botId_key" ON "BotTriggerEvent"("triggerEventId", "speakerId", "recordingId", "botId");
