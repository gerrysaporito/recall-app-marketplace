import { UserDbService } from "./UserDbService";
import { WebhookDbService } from "./WebhookDbService";
import { AppDbService } from "./AppDbService";
import { BotTriggerEventDbService } from "./BotTriggerEventDbService";
import { BotAppDbService } from "./BotAppDbService";
import { BotDbService } from "./BotDbService";

export const DbService = {
  user: UserDbService,
  webhook: WebhookDbService,
  app: AppDbService,
  bot: BotDbService,
  botApp: BotAppDbService,
  botTriggerEvent: BotTriggerEventDbService,
};
