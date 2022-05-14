import { ParsedJSON } from "../json";

export interface CommunicationStrategy<T> {
  handleRequest(
    payload: { data: any } & T
  ): Promise<{ code: number; response: ParsedJSON }>;
}
