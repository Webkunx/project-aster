import { CompressionTypes, Producer } from "kafkajs";
import { Message } from "../message";

export class MessageProducer {
  constructor(private readonly producer: Producer) {}

  async init(): Promise<void> {
    await this.producer.connect();
  }

  async send(message: Message): Promise<void> {
    await this.producer.send({
      topic: "api-gw-requests",
      compression: CompressionTypes.LZ4,
      messages: [
        {
          value: message.serialize(),
        },
      ],
      acks: 0,
    });
  }
}
