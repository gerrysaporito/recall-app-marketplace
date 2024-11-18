import {
  BaseLogger,
  type LogContext,
} from '../LoggerService/BaseLogger';

export class QueueLogger extends BaseLogger {
  constructor(context: LogContext) {
    super({ ...context, service: 'queue-service' });
  }
}
