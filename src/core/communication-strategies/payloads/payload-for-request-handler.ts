export interface PayloadForRequestHandler {
  shouldNotWaitForRequestCompletion?: boolean;
  headers?: Record<string, string> 
}
