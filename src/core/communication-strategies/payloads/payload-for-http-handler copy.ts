import { HTTPMethods } from './../../http-methods';
import { PayloadForRequestHandler } from "./payload-for-request-handler";

export interface PayloadForHTTPHandler extends PayloadForRequestHandler {
  host: string
  method: HTTPMethods
}
