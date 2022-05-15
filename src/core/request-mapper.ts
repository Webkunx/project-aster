import path from "path";
import Ajv from "ajv";
import { readFile } from "fs/promises";
import { HTTPMethods } from "./http-methods";
import { CommunicationStrategy } from "./communication-strategies/communication-strategy";
import { ParsedJSON } from "./json";
import { PayloadForRequestHandler } from "./communication-strategies/payloads/payload-for-request-handler";
import { RequestSchema } from "./request-schema";

const ajv = new Ajv({ allErrors: true, coerceTypes: true });

type ValidationFunction = (data: any) => {
  success: boolean;
  errors?: string[];
};

interface RequestMapLeaf {
  payloadForRequestHandler: PayloadForRequestHandler;
  pathParams: string[];
  validationFunction: ValidationFunction;
}
interface ParsedRequest {
  payloadForRequestHandler: PayloadForRequestHandler;
  params: Record<string, string>;
  validationFunction: ValidationFunction;
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

export class RequestMapper {
  private readonly pathToValidationSchemas: string;
  private requestHandler: CommunicationStrategy | undefined;
  private readonly requestMap: RequestMap;

  constructor({
    pathToValidationSchemas,
  }: {
    pathToValidationSchemas: string;
  }) {
    this.pathToValidationSchemas = pathToValidationSchemas;
    this.requestMap = {};
  }

  async addRequest(request: RequestSchema): Promise<void> {
    const { url, method, validationSchema, payloadForRequestHandler } = request;
    const path = url.split("/").filter((el) => el);
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
            payloadForRequestHandler,
            pathParams,
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

  addHandler(requestHandler: CommunicationStrategy) {
    this.requestHandler = requestHandler;
  }

  private getParsedRequest(request: IncomingRequest): ParsedRequest {
    const { url, method } = request;
    const splitUrl = url.split("/").filter((el) => el);
    let requestMap: RequestMap | RequestMapLeafByMethod = this.requestMap;
    const paramValues: string[] = [];
    for (let urlPart of splitUrl) {
      let newStepRequestMap = (requestMap as RequestMap)[urlPart];
      if (!newStepRequestMap && (requestMap as RequestMap)[":"]) {
        newStepRequestMap = (requestMap as RequestMap)[":"];
        paramValues.push(urlPart);
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

  async handleRequest(request: IncomingRequest): Promise<any> {
    if (!this.requestHandler) {
      throw new Error("no request handler");
    }
    const parsedRequest = this.getParsedRequest(request);
    const { validationFunction, params, payloadForRequestHandler } =
      parsedRequest;
    const data = { ...(request.data as Record<string, unknown>), params };

    if (!validationFunction) {
      console.log("No validation func");

      return await this.requestHandler.handleRequest(
        data,
        payloadForRequestHandler
      );
    }
    const { success, errors } = validationFunction(data);

    if (!success) {
      // errors
      console.log(errors);

      throw new Error("Invalid request");
    }
    return await this.requestHandler.handleRequest(
      data,
      payloadForRequestHandler
    );
  }
}
