import path from "path";
import Ajv from "ajv";
import { readFile } from "fs/promises";

interface DataToSend {
  topic: string;
  messageName: string;
  partitionKey?: string;
  data: any;
}

const ajv = new Ajv({ allErrors: true, coerceTypes: true });

export enum HttpMethods {
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
  GET = "GET",
}

interface Request {
  url: string;
  method: HttpMethods;
}

interface IncomingRequest {
  url: string;
  method: HttpMethods;
  data: any;
}

interface RequestWithValidation extends Request {
  validationSchema?: string;
}

export type RequestToAdd = RequestWithValidation & Omit<DataToSend, "data">;
type RequestHandler = ({
  data,
  partitionKey,
  messageName,
  topic,
}: DataToSend) => any | Promise<any>;
type ValidationFunction = (data: any) => {
  success: boolean;
  errors?: string[];
};
type RequestData = { validationFunction: ValidationFunction } & Omit<
  DataToSend,
  "data"
> & { pathParams: string[] };
type ParsedRequest = Omit<RequestData, "pathParams"> & {
  params: Record<string, string>;
};
type RequestMapLeaf = {
  [key in HttpMethods]?: RequestData;
};
type RequestMap = {
  [key: string]: RequestMap | RequestMapLeaf;
};

export class RequestMapper {
  private readonly pathToValidationSchemas: string;
  private requestHandler: RequestHandler | undefined;
  private readonly requestMap: RequestMap;

  constructor({
    pathToValidationSchemas,
  }: {
    pathToValidationSchemas: string;
  }) {
    this.pathToValidationSchemas = pathToValidationSchemas;
    this.requestMap = {};
  }

  async addRequest(request: RequestToAdd): Promise<void> {
    const { url, method, validationSchema, messageName, topic, partitionKey } =
      request;
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
            messageName,
            topic,
            partitionKey,
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

  addHandler(requestHandler: RequestHandler) {
    this.requestHandler = requestHandler;
  }

  private getParsedRequest(request: IncomingRequest): ParsedRequest {
    const { url, method } = request;
    const splitUrl = url.split("/").filter((el) => el);
    let requestMap: RequestMap | RequestMapLeaf = this.requestMap;
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
    const requestData = (requestMap as RequestMapLeaf)[method];
    if (!requestData) {
      throw new Error("Unknown request");
    }
    return {
      ...requestData,
      params: requestData.pathParams.reduce(
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
    const { topic, messageName, partitionKey, validationFunction, params } =
      parsedRequest;

    if (!validationFunction) {
      console.log("No validation func");

      return await this.requestHandler({
        data: request.data,
        partitionKey,
        topic,
        messageName,
      });
    }
    const data = request.data;
    if (Object.keys(params).length) {
      data.params = params;
    }
    const { success, errors } = validationFunction(data);

    if (!success) {
      // errors
      console.log(errors);

      throw new Error("Invalid request");
    }
    return await this.requestHandler({
      data: request.data,
      partitionKey,
      topic,
      messageName,
    });
  }
}
