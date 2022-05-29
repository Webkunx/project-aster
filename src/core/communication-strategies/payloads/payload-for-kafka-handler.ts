import { PayloadForRequestHandler } from "./payload-for-request-handler";

export interface PayloadForKafkaHandler extends PayloadForRequestHandler {
  topic: string;
  partitionKey?: string;
}
