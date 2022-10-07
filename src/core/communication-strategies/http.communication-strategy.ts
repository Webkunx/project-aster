import { Logger } from "./../../common/logger";
import { PayloadForHTTPHandler } from "./payloads/payload-for-http-handler copy";
import { ParsedJSON } from "../../common/parsed-json";
import { Response } from "../response";
import { CommunicationStrategy } from "./communication-strategy";
import { Pool } from "undici";

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
    data: ParsedJSON,
    payload: PayloadForHTTPHandler,
    requestUrl: string
  ): Promise<Response> {
    const { targetUrl, host, headers, method } = payload;
    const url = targetUrl || requestUrl;
    const pool = this.getPool(host);

    const {
      body,
      headers: responseHeaders,
      statusCode,
    } = await pool.request({
      body: JSON.stringify(data),
      method,
      path: url,
      headers,
    });

    const parsedBody = await body.json();
    logger.info({ message: parsedBody });

    return Response.SuccessResponse({
      code: statusCode,
      body: parsedBody,
      headers: responseHeaders,
    });
  }

  private getPool(host: string): Pool {
    if (!(host in this.pools)) {
      this.pools[host] = new Pool(host);
    }
    return this.pools[host];
  }
}
