import { v4 as uuid } from "uuid";

type StringObject = Record<string, string>;

export class Message {
  public readonly data?: StringObject;
  public readonly headers?: StringObject;

  constructor({
    data,
    headers,
  }: {
    headers?: StringObject;
    data?: StringObject;
  }) {
    this.data = data;
    this.headers = headers;
  }

  static from(rawMessage: null): Message;
  static from(rawMessage: string): Message;
  static from(rawMessage: Buffer): Message;
  static from(rawMessage: Buffer | null | string): Message {
    if (!rawMessage) return Message.blankMessage();
    const stringifiedMessage =
      typeof rawMessage === "string" ? rawMessage : rawMessage.toString();
    if (!stringifiedMessage) return Message.blankMessage();
    const { headers, data } = JSON.parse(stringifiedMessage);
    return new Message({ data, headers });
  }

  static blankMessage() {
    return new Message({});
  }

  static messageWithCorrelationId({
    headers,
    data,
  }: {
    data?: StringObject;
    headers?: StringObject;
  }) {
    return new MessageWithCorrelationId({ headers, data });
  }

  serialize() {
    return JSON.stringify({
      headers: this.headers,
      data: this.data,
    });
  }
}

class MessageWithCorrelationId extends Message {
  public readonly correlationId: string;

  constructor({
    headers,
    data,
  }: {
    headers?: StringObject;
    data?: StringObject;
  }) {
    const correlationId = uuid();
    headers = { ...headers, id: correlationId };
    super({ headers, data });
    this.correlationId = correlationId;
  }

  getCorrelationId(): string {
    return this.correlationId;
  }
}
