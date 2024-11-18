export enum WebhookEventType {
  // Account
  account_created = "account.created",
  account_updated = "account.updated",
}

type LiteralType = `${WebhookEventType}`;
export const WebhookEventTypeValues = Object.values(WebhookEventType) as [
  LiteralType,
  ...LiteralType[],
];
