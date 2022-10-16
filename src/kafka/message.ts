import { Headers } from "./../common/headers";
import { ParsedJSON } from "../common/parsed-json";
import { v4 as uuid } from "uuid";

export class Message {
  public readonly data?: ParsedJSON;
  public readonly headers?: Headers;

  constructor({ data, headers }: { headers?: Headers; data?: ParsedJSON }) {
    this.data = data;
    this.headers = headers;
  }

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
    data?: ParsedJSON;
    headers?: Headers;
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

  constructor({ headers, data }: { headers?: Headers; data?: ParsedJSON }) {
    const correlationId = uuid();
    headers = { ...headers, id: correlationId };
    super({ headers, data });
    this.correlationId = correlationId;
  }

  getCorrelationId(): string {
    return this.correlationId;
  }
}
