import { ParsedJSON } from "../json";
import { PayloadForRequestHandler } from "./payloads/payload-for-request-handler";
import { CommunicationStrategy } from "./communication-strategy";

export class LoggingCommunicationStrategy implements CommunicationStrategy {
  async handleRequest(
    data: ParsedJSON,
    payload: PayloadForRequestHandler
  ): Promise<{ code: number; response: ParsedJSON }> {
    console.log("========");

    console.log("data", JSON.stringify(data, null, 2));
    console.log("payload", JSON.stringify(payload, null, 2));
    return { code: 200, response: { success: true } };
  }
}
