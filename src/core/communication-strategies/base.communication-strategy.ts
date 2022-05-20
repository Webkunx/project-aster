import { ParsedJSON } from "../json";
import { PayloadForRequestHandler } from "./payloads/payload-for-request-handler";
import { CommunicationStrategy } from "./communication-strategy";

export class BaseCommunicationStrategy implements CommunicationStrategy {
  private readonly _name: string;
  constructor(data?: { name?: string }) {
    const { name } = data || {};
    this._name = name || "Base";
  }
  get name() {
    return this._name;
  }
  async handleRequest(
    data: ParsedJSON,
    payload: PayloadForRequestHandler
  ): Promise<{ code?: number; response: ParsedJSON }> {
    return { response: { data, payload: payload as ParsedJSON } };
  }
}
