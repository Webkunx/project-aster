import path from "path";
import Ajv from "ajv";
import { readFile } from "fs/promises";
import { HTTPMethods } from "./http-methods";
import {
  CommunicationStrategy,
  CommunicationStrategyName,
} from "./communication-strategies/communication-strategy";
import { ParsedJSON } from "./json";
import {
  ParamsToExtractFromResponse,
  RequestHandlerSchema,
  RequestSchema,
} from "./request-schema";
import { PayloadForRequestHandler } from "./communication-strategies/payloads/payload-for-request-handler";

const ajv = new Ajv({ allErrors: true, coerceTypes: true });

type ValidationFunction = (data: any) => {
  success: boolean;
  errors?: string[];
};

interface RequestMapLeaf {
  pathParams: string[];
  validationFunction: ValidationFunction;
  requestHandlersSchemas?: RequestHandlerSchema[];
  defaultPayloadForRequestHandler: PayloadForRequestHandler;
}
interface ParsedRequest extends Omit<RequestMapLeaf, "pathParams"> {
  params: Record<string, string>;
}

type RequestMapLeafByMethod = {
  [key in HTTPMethods]?: RequestMapLeaf;
};
type RequestMap = {
  [key: string]: RequestMap | RequestMapLeafByMethod;
};
interface IncomingRequest {
  url: string;
  method: HTTPMethods;
  data: ParsedJSON;
}
interface RequestHandlerToAdd {
  requestHandler: CommunicationStrategy;
  isDefault?: boolean;
}

export class RequestMapper {
  private readonly pathToValidationSchemas: string;
  private requestHandlers: Record<
    CommunicationStrategyName,
    CommunicationStrategy
  > = {};
  private defaultRequestHanlerId: string | undefined;
  private readonly requestMap: RequestMap;

  constructor({
    pathToValidationSchemas,
    requestHandlersToAdd,
  }: {
    pathToValidationSchemas: string;
    requestHandlersToAdd?: RequestHandlerToAdd[];
  }) {
    this.pathToValidationSchemas = pathToValidationSchemas;
    this.requestMap = {};
    if (requestHandlersToAdd?.length) {
      this.addRequestHandlers(requestHandlersToAdd);
    }
  }

  private static parseUrl(url: string) {
    return url.split("/").filter((el) => el);
  }

  async addRequest(request: RequestSchema): Promise<void> {
    const {
      url,
      method,
      validationSchema,
      defaultPayloadForRequestHandler,
      requestHandlersSchemas,
    } = request;
    const path = RequestMapper.parseUrl(url);
    let requestMapFromLastStep = this.requestMap;
    const pathParams = [];
    for (let i = 0; i < path.length; i++) {
      const isPathParam = path[i].startsWith(":");
      const pathPart = isPathParam ? ":" : path[i];
      requestMapFromLastStep[pathPart] =
        (requestMapFromLastStep[pathPart] as RequestMap) || {};
      if (isPathParam) {
        pathParams.push(path[i].substring(1));
      }
      if (i === path.length - 1) {
        requestMapFromLastStep[pathPart] = {
          [method]: {
            defaultPayloadForRequestHandler,
            pathParams,
            requestHandlersSchemas,
            validationFunction: validationSchema
              ? await this.getValidationFunction(validationSchema)
              : null,
          },
        };
        break;
      }
      requestMapFromLastStep = requestMapFromLastStep[pathPart] as RequestMap;
    }
  }

  private async getValidationFunction(validationSchemaPath: string) {
    // TODO: change to strategy to have S3
    const validationSchema = JSON.parse(
      await readFile(
        path.join(this.pathToValidationSchemas, validationSchemaPath + ".json"),
        "utf-8"
      )
    );
    const ajvValidationFunction = ajv.compile(validationSchema);
    return (data: any) => {
      const isValid = ajvValidationFunction(data);
      if (!isValid) {
        return {
          success: false,
          errors: ajvValidationFunction!.errors!.map(
            (err) => `parameter: ${err.dataPath} ${err.message}`
          ),
        };
      }
      return { success: true };
    };
  }

  addRequestHandlers(requestHandlersToAdd: RequestHandlerToAdd[]) {
    requestHandlersToAdd.forEach((value) => {
      this.addRequestHandler(value);
    });
  }

  addRequestHandler({ requestHandler, isDefault }: RequestHandlerToAdd) {
    this.requestHandlers[requestHandler.name] = requestHandler;
    this.setDefaultRequestHanlerId({ requestHandler, isDefault });
  }

  private setDefaultRequestHanlerId({
    requestHandler,
    isDefault,
  }: RequestHandlerToAdd) {
    if (isDefault || !this.defaultRequestHanlerId) {
      this.defaultRequestHanlerId = requestHandler.name;
    }
  }

  private getParsedRequest(request: IncomingRequest): ParsedRequest {
    const { url, method } = request;
    const path = RequestMapper.parseUrl(url);
    let requestMap: RequestMap | RequestMapLeafByMethod = this.requestMap;
    const paramValues: string[] = [];
    for (let pathPart of path) {
      let newStepRequestMap = (requestMap as RequestMap)[pathPart];
      if (!newStepRequestMap && (requestMap as RequestMap)[":"]) {
        newStepRequestMap = (requestMap as RequestMap)[":"];
        paramValues.push(pathPart);
      }
      requestMap = newStepRequestMap;
      if (!requestMap) {
        throw new Error("Unknown request");
      }
    }
    const requestMapLeaf = (requestMap as RequestMapLeafByMethod)[method];
    if (!requestMapLeaf) {
      throw new Error("Unknown request");
    }
    return {
      ...requestMapLeaf,
      params: requestMapLeaf.pathParams.reduce(
        (acc: Record<string, string>, value, idx) => {
          acc[value] = paramValues[idx];
          return acc;
        },
        {}
      ),
    };
  }

  private getFunctionToHandleRequest(
    parsedRequest: ParsedRequest
  ): (data: ParsedJSON) => Promise<any> {
    if (!parsedRequest.requestHandlersSchemas?.length) {
      const requestHandler =
        this.requestHandlers?.[this.defaultRequestHanlerId || ""];
      if (!requestHandler) {
        throw new Error("no request handler");
      }
      return (data) => {
        return requestHandler.handleRequest(
          data,
          parsedRequest.defaultPayloadForRequestHandler
        );
      };
    }

    return async (data) => {
      const requestHandlersSchemas =
        parsedRequest.requestHandlersSchemas as RequestHandlerSchema[];
      const handlersReponses: Record<string, ParsedJSON> = {};
      let lastHandlerResponse = null;
      const requestHandlersSchemasLength =
        requestHandlersSchemas?.length as number;
      for (let i = 0; i < requestHandlersSchemasLength; i++) {
        const requestHandlerSchema = requestHandlersSchemas[i];
        const {
          name,
          shouldNotWaitForRequestCompletion,
          paramsToExtract,
          payloadForRequestHandler,
        } = requestHandlerSchema;
        const requestHandler = this.requestHandlers[name];
        const response = await requestHandler.handleRequest(
          { data, ...handlersReponses },
          payloadForRequestHandler
        );
        if (
          paramsToExtract === ParamsToExtractFromResponse.AllParams &&
          response.response
        ) {
          handlersReponses[name] = response.response;
        }
        if (requestHandlersSchemasLength - 1 === i) {
          lastHandlerResponse = response;
        }
      }
      return lastHandlerResponse;
    };
  }

  // TODO: add proper error handling
  async handleRequest(request: IncomingRequest): Promise<any> {
    const parsedRequest = this.getParsedRequest(request);
    const { validationFunction, params } = parsedRequest;
    const handleRequest = this.getFunctionToHandleRequest(parsedRequest);

    const data = { ...(request.data as Record<string, unknown>), params };

    if (!validationFunction) {
      return await handleRequest(data);
    }
    const { success, errors } = validationFunction(data);

    if (!success) {
      // TODO: change to proper error handling
      console.log(errors);

      throw new Error("Invalid request");
    }
    return await handleRequest(data);
  }
}
