import {
  AssignerProtocol,
  Consumer,
  EachMessagePayload,
  MemberAssignment,
} from "kafkajs";
import EventEmitter from "events";
import { Message } from "./message";

type EachMessageListener = (payload: EachMessagePayload) => Promise<void>;

export class MessageConsumer extends EventEmitter {
  private readonly topic: string;
  private partition: number | undefined;
  constructor(private readonly consumer: Consumer) {
    super();
    this.topic = "api-gw-responses";
  }

  async init() {
    await this.consumer.connect();
    await this.consumer.subscribe({
      topic: this.topic,
      fromBeginning: false,
    });
    await this.consumer.run({
      eachMessage: await this.getResponsesListener(),
      autoCommitInterval: 10,
      autoCommitThreshold: 1,
    });
  }

  async getConsumerDetails() {
    if (this.partition === undefined) {
      const { memberAssignment } = (await this.consumer.describeGroup())
        .members[0];
      const { assignment } = AssignerProtocol.MemberAssignment.decode(
        memberAssignment
      ) as MemberAssignment;
      this.partition = assignment[this.topic][0];
    }
    return { partition: this.partition, topic: this.topic };
  }

  private getResponsesListener(): EachMessageListener {
    return async (payload) => {
      const { message: rawMessage } = payload;
      const message = Message.from(rawMessage?.value);
      const correlationId = message?.headers?.id;
      if (!correlationId) return;
      this.emit(correlationId as string, message);
    };
  }
}
