import { ParsedJSON } from "../../common/json";
import { PayloadForRequestHandler } from "./payloads/payload-for-request-handler";
import { CommunicationStrategy } from "./communication-strategy";
import { Response } from "../response";

export class BaseCommunicationStrategy implements CommunicationStrategy {
  private readonly _name: string;
  constructor(data?: { name?: string }) {
    const { name } = data || {};
    this._name = name || "Base";
  }
  async handleRequest(
    data: ParsedJSON,
    payload: PayloadForRequestHandler
  ): Promise<Response> {
    return Response.SuccessResponse({
      body: { data, payload: payload as ParsedJSON },
    });
  }
  get name() {
    return this._name;
  }
}
