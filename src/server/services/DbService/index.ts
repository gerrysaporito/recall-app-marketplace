import { UserDbService } from "./UserDbService";
import { WebhookDbService } from "./WebhookDbService";
import { AppDbService } from "./AppDbService";
import { BotTriggerEventDbService } from "./BotTriggerEventDbService";
import { BotTemplateAppDbService } from "./BotTemplateAppDbService";
import { BotTemplateAppDataFieldDbService } from "./BotTemplateAppDataFieldDbService";
import { BotTemplateDbService } from "./BotTemplateDbService";

export const DbService = {
  user: UserDbService,
  webhook: WebhookDbService,
  app: AppDbService,
  botTemplate: BotTemplateDbService,
  botTemplateApp: BotTemplateAppDbService,
  botTemplateAppDataField: BotTemplateAppDataFieldDbService,
  botTriggerEvent: BotTriggerEventDbService,
};
