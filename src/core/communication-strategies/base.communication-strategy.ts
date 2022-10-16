import { ParsedJSON } from "../../common/parsed-json";
import { PayloadForRequestHandler } from "./payloads/payload-for-request-handler";
import { CommunicationStrategy } from "./communication-strategy";
import { Response } from "../response";
import { IncomingRequestData } from "../../common/incoming-request-data";

export class BaseCommunicationStrategy implements CommunicationStrategy {
  public readonly name: string;
  constructor(data?: { name?: string }) {
    const { name } = data || {};
    this.name = name || "Base";
  }
  async handleRequest(
    incomingRequestData: IncomingRequestData,
    requestUrl: string,
    handlersData: Record<string, ParsedJSON>,
    payload: PayloadForRequestHandler
  ): Promise<Response> {
    return Response.CustomResponse({
      body: {
        data: { ...incomingRequestData, ...handlersData },
        payload: payload as ParsedJSON,
      },
    });
  }
}
