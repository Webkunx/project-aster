import { CompressionTypes, Producer } from "kafkajs";
import { Message } from "./message";

export class MessageProducer {
  constructor(private readonly producer: Producer) {}

  async init(): Promise<void> {
    await this.producer.connect();
  }

  async send({
    message,
    topic,
    partitionKey,
  }: {
    message: Message;
    topic?: string;
    partitionKey?: string;
  }): Promise<void> {
    await this.producer.send({
      topic: topic || "api-gw-requests",
      compression: CompressionTypes.LZ4,
      messages: [
        {
          key: partitionKey || null,
          value: message.serialize(),
        },
      ],
      acks: 0,
    });
  }
}
