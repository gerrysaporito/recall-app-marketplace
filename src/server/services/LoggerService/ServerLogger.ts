import type { LogContext } from '../LoggerService/BaseLogger';
import { BaseLogger } from '../LoggerService/BaseLogger';

export class ServerLogger extends BaseLogger {
  constructor(context: LogContext) {
    super({ ...context, service: 'server-service' });
  }
}
