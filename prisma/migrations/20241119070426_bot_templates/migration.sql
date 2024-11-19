/*
  Warnings:

  - Added the required column `type` to the `AppDataField` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "BotTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    "userId" TEXT NOT NULL,
    CONSTRAINT "BotTemplate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BotTemplateApp" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    "appId" TEXT NOT NULL,
    "botTemplateId" TEXT NOT NULL,
    CONSTRAINT "BotTemplateApp_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BotTemplateApp_botTemplateId_fkey" FOREIGN KEY ("botTemplateId") REFERENCES "BotTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BotTemplateAppDataField" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "value" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    "botTemplateAppId" TEXT NOT NULL,
    "appDataFieldId" TEXT NOT NULL,
    CONSTRAINT "BotTemplateAppDataField_botTemplateAppId_fkey" FOREIGN KEY ("botTemplateAppId") REFERENCES "BotTemplateApp" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BotTemplateAppDataField_appDataFieldId_fkey" FOREIGN KEY ("appDataFieldId") REFERENCES "AppDataField" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Bot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "meetingUrl" TEXT NOT NULL,
    "recallBotId" TEXT NOT NULL,
    "botTemplateId" TEXT NOT NULL,
    CONSTRAINT "Bot_botTemplateId_fkey" FOREIGN KEY ("botTemplateId") REFERENCES "BotTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BotTriggerEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recallBotId" TEXT NOT NULL,
    "args" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_App" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    "userId" TEXT NOT NULL,
    "webhookId" TEXT NOT NULL,
    "botTemplateId" TEXT,
    CONSTRAINT "App_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "App_webhookId_fkey" FOREIGN KEY ("webhookId") REFERENCES "Webhook" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "App_botTemplateId_fkey" FOREIGN KEY ("botTemplateId") REFERENCES "BotTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_App" ("createdAt", "deletedAt", "description", "id", "name", "updatedAt", "userId", "webhookId") SELECT "createdAt", "deletedAt", "description", "id", "name", "updatedAt", "userId", "webhookId" FROM "App";
DROP TABLE "App";
ALTER TABLE "new_App" RENAME TO "App";
CREATE TABLE "new_AppDataField" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    "appId" TEXT NOT NULL,
    CONSTRAINT "AppDataField_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_AppDataField" ("appId", "createdAt", "deletedAt", "id", "key", "updatedAt", "value") SELECT "appId", "createdAt", "deletedAt", "id", "key", "updatedAt", "value" FROM "AppDataField";
DROP TABLE "AppDataField";
ALTER TABLE "new_AppDataField" RENAME TO "AppDataField";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
