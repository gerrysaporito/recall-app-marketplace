import { UserDbService } from './UserDbService';
import { WebhookDbService } from './WebhookDbService';

export const DbService = {
  user: UserDbService,
  webhook: WebhookDbService,
};
