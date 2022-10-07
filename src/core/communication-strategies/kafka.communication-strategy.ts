import { MessageConsumer } from "../../kafka/message-consumer";
import { MessageProducer } from "./../../kafka/message-producer";
import { ParsedJSON } from "../../common/parsed-json";
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

  // TODO: Add Garbage Collection
  // TODO: 
  async handleRequest(
    data: ParsedJSON,
    payload: PayloadForKafkaHandler
  ): Promise<Response> {
    const { topic, partitionKey, shouldNotWaitForRequestCompletion } = payload;
    const result: Message = await new Promise(async (res) => {
      const { partition: partitionToRespond, topic: topicToRespond } =
        await this.consumer.getConsumerDetails();

      const message = Message.messageWithCorrelationId({
        data,
        headers: {
          topicToRespond,
          partitionToRespond,
          awaitsResponse: !shouldNotWaitForRequestCompletion,
        },
      });
      if (shouldNotWaitForRequestCompletion) {
        return Response.SuccessResponse();
      }
      const id = message.getCorrelationId();
      this.consumer.on(id, (data: Message) => {
        res(data);
        this.consumer.removeListener(id, () => {});
      });
      await this.producer.send({
        message,
        topic,
        partitionKey: KafkaCommunicationStrategy.getPartitionKey(
          partitionKey,
          data
        ),
      });
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

  private static getPartitionKey(
    partitionKeyPath: string | undefined,
    data: ParsedJSON
  ): string | undefined {
    if (!partitionKeyPath) return;
    const partitionKeyPathParsed = partitionKeyPath.split(".");
    let dataForLastPathPart: Record<string, unknown> | unknown = data as Record<
      string,
      unknown
    >;
    for (let i = 0; i < partitionKeyPathParsed.length; i++) {
      const pathPart = partitionKeyPathParsed[i];
      dataForLastPathPart = (dataForLastPathPart as Record<string, unknown>)[
        pathPart
      ];
      if (
        typeof dataForLastPathPart !== "object" &&
        i !== partitionKeyPathParsed.length - 1
      ) {
        return;
      }
    }
    if (typeof dataForLastPathPart === "string") {
      return dataForLastPathPart;
    }
    if (typeof dataForLastPathPart === "number") {
      return `${dataForLastPathPart}`;
    }
    return;
  }
}
