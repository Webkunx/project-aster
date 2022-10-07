import { ParsedJSON } from "../common/parsed-json";
import { Headers } from "../common/headers";

export class Response {
  private constructor(
    public readonly code: number,
    public readonly body: ParsedJSON,
    public readonly headers?: Headers
  ) {}

  static CustomResponse({
    body,
    code,
    headers,
  }: {
    body?: ParsedJSON;
    code?: number;
    headers?: Headers;
  } = {}): Response {
    return new Response(this.getCode(code), this.getBody(body), headers);
  }

  static RequestWithInvalidBodyResponse(errors: string[]): Response {
    return new Response(422, { errors, success: false });
  }
  static UnknownRequestResponse(): Response {
    return new Response(404, { errors: ["Unknown request"], success: false });
  }
  static RequestTimeoutResponse(): Response {
    return new Response(504, { errors: ["Request timeout"], success: false });
  }
  static InternalErrorResponse(): Response {
    return new Response(500, { errors: ["Internal Error"], success: false });
  }
  private static getBody(body?: ParsedJSON): ParsedJSON {
    return body || { success: true };
  }
  private static getCode(code?: number): number {
    return code || 200;
  }
}
