import { ParsedJSON } from "../../common/parsed-json";
import { PayloadForRequestHandler } from "./payloads/payload-for-request-handler";
import { CommunicationStrategy } from "./communication-strategy";
import { Response } from "../response";
import { Logger } from "../../common/logger";

const logger = Logger.getLogger("logging-communication-strategy");

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
    logger.info({ message: "========" });
    logger.info({
      message: "See Data!",
      payload: {
        data,
        payload,
      },
    });
    logger.info({ message: "========" });

    return Response.CustomResponse({});
  }
  get name() {
    return this._name;
  }
}
