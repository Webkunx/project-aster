import { Logger } from "./../../common/logger";
import { PayloadForHTTPHandler } from "./payloads/payload-for-http-handler copy";
import { ParsedJSON } from "../../common/parsed-json";
import { Response } from "../response";
import { CommunicationStrategy } from "./communication-strategy";
import { Pool } from "undici";
import { IncomingRequestData } from "../../common/incoming-request-data";

const logger = Logger.getLogger("http-undici");
export class HTTPCommunicationStrategy
  implements CommunicationStrategy<PayloadForHTTPHandler>
{
  readonly name: string;
  private readonly pools: Record<string, Pool> = {};

  constructor() {
    this.name = "http-undici";
  }

  async handleRequest(
    incomingRequestData: IncomingRequestData,
    requestUrl: string,
    handlersData: Record<string, ParsedJSON>,
    payload: PayloadForHTTPHandler
  ): Promise<Response> {
    const { targetUrl, host, headers: payloadHeaders, method } = payload;
    const url = targetUrl || requestUrl;
    const pool = this.getPool(host);
    const {
      query,
      body: incomingRequestBody,
      headers: incomingRequestHeaders,
    } = incomingRequestData;

    logger.info({
      message: "Ooops",
      payload: { ...incomingRequestHeaders, ...payloadHeaders },
    });
    const {
      body,
      headers: responseHeaders,
      statusCode,
    } = await pool.request({
      body: JSON.stringify({ body: incomingRequestBody, ...handlersData }),
      method,
      path: url,
      // TODO - fix connection header; // try to add params to url
      headers: { ...payloadHeaders } as any,
      query,
    });

    const parsedBody = await body.json();
    logger.info({ message: parsedBody });

    return Response.CustomResponse({
      code: statusCode,
      body: parsedBody,
      headers: responseHeaders as any,
    });
  }

  private getPool(host: string): Pool {
    if (!(host in this.pools)) {
      this.pools[host] = new Pool(host);
    }
    return this.pools[host];
  }
}
