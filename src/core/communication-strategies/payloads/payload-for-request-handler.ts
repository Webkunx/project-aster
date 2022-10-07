import { Headers } from "./../../../common/headers";
export interface PayloadForRequestHandler {
  shouldNotWaitForRequestCompletion?: boolean;
  headers?: Headers;
}
