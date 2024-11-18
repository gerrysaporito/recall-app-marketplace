import { UserDbService } from "./UserDbService";
import { WebhookDbService } from "./WebhookDbService";
import { AppDbService } from "./AppDbService";

export const DbService = {
  user: UserDbService,
  webhook: WebhookDbService,
  app: AppDbService,
};
