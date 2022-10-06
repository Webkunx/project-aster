import { ParsedJSON } from "../../common/parsed-json";
import { PayloadForRequestHandler } from "./payloads/payload-for-request-handler";
import { CommunicationStrategy } from "./communication-strategy";
import { Response } from "../response";

export class LoggingCommunicationStrategy implements CommunicationStrategy {
  private readonly _name: string;
  constructor(data?: { name?: string }) {
    const { name } = data || {};
    this._name = name || "Base";
  }
  async handleRequest(
    data: ParsedJSON,
    payload: PayloadForRequestHandler
  ): Promise<Response> {
    console.log("========");

    console.log("data", JSON.stringify(data, null, 2));
    console.log("payload", JSON.stringify(payload, null, 2));
    return Response.SuccessResponse({});
  }
  get name() {
    return this._name;
  }
}
