import { Consumer, EachMessagePayload, Kafka } from "kafkajs";
import EventEmitter from "events";
import { Message } from "../message";

type EachMessageListener = (payload: EachMessagePayload) => Promise<void>;

export class MessageConsumer extends EventEmitter {
  constructor(private readonly consumer: Consumer) {
    super();
  }

  async init() {
    await this.consumer.connect();
    await this.consumer.subscribe({
      topic: "api-gw-responses",
      fromBeginning: false,
    });
    await this.consumer.run({ eachMessage: await this.getResponsesListener() });
  }

  private getResponsesListener(): EachMessageListener {
    return async (payload) => {
      const { message: rawMessage } = payload;
      const { headers } = Message.from(rawMessage?.value);
      if (!headers?.id) return;
      this.emit(headers.id, Message);
    };
  }
}
