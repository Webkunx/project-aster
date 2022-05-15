import { PayloadForRequestHandler } from "./payload-for-request-handler";

interface PayloadForKafkaHandler extends PayloadForRequestHandler {
  topic: string;
  partitionKey?: string;
  messageName: string;
}
