import { ParsedJSON } from "./json";

export class Response {
  public readonly body: ParsedJSON;
  public readonly code: number;
  private constructor({ body, code }: { body: ParsedJSON; code: number }) {
    this.body = body;
    this.code = code;
  }

  static SuccessResponse({
    body,
    code,
  }: {
    body?: ParsedJSON;
    code?: number;
  } = {}): Response {
    return new Response({ body: this.getBody(body), code: this.getCode(code) });
  }

  static RequestWithInvalidBodyResponse(errors: string[]): Response {
    return new Response({ code: 422, body: { errors, success: false } });
  }
  static UnknownRequestResponse(): Response {
    return new Response({
      code: 404,
      body: { errors: ["Unknown request"], success: false },
    });
  }
  static RequestTimeoutResponse(): Response {
    return new Response({
      code: 504,
      body: { errors: ["Request timeout"], success: false },
    });
  }
  static InternalErrorResponse(): Response {
    return new Response({
      code: 500,
      body: { errors: ["Internal Error"], success: false },
    });
  }
  private static getBody(body?: ParsedJSON): ParsedJSON {
    return body || { success: true };
  }
  private static getCode(code?: number): number {
    return code || 200;
  }
}
