export enum WebhookEventType {
  event_triggered = "event.triggered",
}

type LiteralType = `${WebhookEventType}`;
export const WebhookEventTypeValues = Object.values(WebhookEventType) as [
  LiteralType,
  ...LiteralType[]
];
