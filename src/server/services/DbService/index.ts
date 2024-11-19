import { UserDbService } from "./UserDbService";
import { WebhookDbService } from "./WebhookDbService";
import { AppDbService,  } from "./AppDbService";
import { BotTriggerEventDbService } from "./BotTriggerEventDbService";
import { BotAppDbService } from "./BotAppDbService";
import { BotAppDataFieldDbService } from "./BotAppDataFieldDbService";
import { BotDbService } from "./BotDbService";

export const DbService = {
  user: UserDbService,
  webhook: WebhookDbService,
  app: AppDbService,
  bot: BotDbService,
  botApp: BotAppDbService,
  botAppDataField: BotAppDataFieldDbService,
  botTriggerEvent: BotTriggerEventDbService,
};
