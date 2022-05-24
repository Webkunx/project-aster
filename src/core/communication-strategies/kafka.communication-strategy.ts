import { MessageConsumer } from "../../kafka/message-consumer";
import { MessageProducer } from "./../../kafka/message-producer";
import { ParsedJSON } from "../json";
import { Response } from "../response";
import { CommunicationStrategy } from "./communication-strategy";
import { PayloadForKafkaHandler } from "./payloads/payload-for-kafka-handler";
import { kafkaFactory } from "../../kafka/kafka.factory";
import { Message } from "../../kafka/message";
export class KafkaCommunicationStrategy
  implements CommunicationStrategy<PayloadForKafkaHandler>
{
  readonly name: string;
  private readonly producer: MessageProducer;
  private readonly consumer: MessageConsumer;
  constructor() {
    this.name = "kafka";
    const kafka = kafkaFactory(["localhost:29092"]);
    this.producer = new MessageProducer(kafka.producer());
    this.consumer = new MessageConsumer(kafka.consumer({ groupId: "somekek" }));
  }
  async init() {
    await this.consumer.init();
    await this.producer.init();
  }
  // TODO: Add support for custom topic, partition key and add message name to message
  async handleRequest(
    data: ParsedJSON,
    payload: PayloadForKafkaHandler
  ): Promise<Response> {
    const result: Message = await new Promise(async (res) => {
      const { partition: partitionToRespond, topic: topicToRespond } =
        await this.consumer.getConsumerDetails();

      const message = Message.messageWithCorrelationId({
        data,
        headers: { topicToRespond, partitionToRespond, awaitsResponse: true },
      });
      const id = message.getCorrelationId();
      this.consumer.on(id, (data: Message) => {
        res(data);
        this.consumer.removeListener(id, () => {});
      });
      await this.producer.send(message);
    });

    const response = Response.SuccessResponse({
      code: 200,
      body: {
        data: result.data,
        headers: result.headers,
      } as ParsedJSON,
    });
    return response;
  }
}
