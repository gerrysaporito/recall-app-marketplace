import { UserDbService } from "./UserDbService";
import { WebhookDbService } from "./WebhookDbService";
import { AppDbService } from "./AppDbService";
import { BotDbService } from "./BotDbService";
import { BotTriggerEventDbService } from "./BotTriggerEventDbService";
import { BotTemplateAppDbService } from "./BotTemplateAppDbService";
import { BotTemplateAppDataFieldDbService } from "./BotTemplateAppDataFieldDbService";
import { BotTemplateDbService } from "./BotTemplateDbService";
import { BotTranscriptDbService } from "./BotTranscriptDbService";

export const DbService = {
  user: UserDbService,
  webhook: WebhookDbService,
  app: AppDbService,
  bot: BotDbService,
  botTemplate: BotTemplateDbService,
  botTemplateApp: BotTemplateAppDbService,
  botTemplateAppDataField: BotTemplateAppDataFieldDbService,
  botTriggerEvent: BotTriggerEventDbService,
  botTranscript: BotTranscriptDbService,
};
