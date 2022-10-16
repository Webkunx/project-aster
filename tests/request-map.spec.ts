import { PayloadForKafkaHandler } from "./../src/core/communication-strategies/payloads/payload-for-kafka-handler";
import { CommunicationStrategy } from "./../src/core/communication-strategies/communication-strategy";
import path from "path";
import { HTTPMethods } from "../src/core/http-methods";
import { RequestMapper } from "../src/core/request-mapper";
import {
  ParamsToExtractFromResponse,
  RequestSchema,
} from "../src/core/request-schema";
import { BaseCommunicationStrategy } from "../src/core/communication-strategies/base.communication-strategy";
import { PayloadForRequestHandler } from "../src/core/communication-strategies/payloads/payload-for-request-handler";

const baseHandler = new BaseCommunicationStrategy();

// STEPS
// proper error handling
// proper logger
describe("RequestMapper", () => {
  describe("Routing", () => {
    it("Adds simple request to map and handles it correctly", async () => {
      const request: RequestSchema = {
        url: "/simple",
        method: HTTPMethods.POST,
        defaultPayloadForRequestHandler: {
          topic: "simple",
        } as PayloadForKafkaHandler,
        validationSchema: "simple",
      };

      const requestMapper = new RequestMapper({
        pathToValidationSchemas: path.join(
          __dirname,
          "../tests/validationSchemas"
        ),
      });
      await requestMapper.addRequest(request);
      requestMapper.addRequestHandler({ requestHandler: baseHandler });

      const result = await requestMapper.handleRequest({
        url: "/simple",
        method: HTTPMethods.POST,
        data: { body: 12, query: {}, headers: {} },
      });

      expect(result.body).toEqual({
        data: { body: 12, params: {}, query: {}, headers: {} },
        payload: {
          topic: "simple",
        },
      });
    });
    it("Updates simple request in map and handles it correctly", async () => {
      const request: RequestSchema = {
        url: "/simple",
        method: HTTPMethods.POST,
        defaultPayloadForRequestHandler: {
          topic: "simple",
        } as PayloadForKafkaHandler,
        validationSchema: "simple",
      };
      const request2: RequestSchema = {
        url: "/simple",
        method: HTTPMethods.POST,
        defaultPayloadForRequestHandler: {
          topic: "simple2",
        } as PayloadForKafkaHandler,
      };

      const requestMapper = new RequestMapper({
        pathToValidationSchemas: path.join(
          __dirname,
          "../tests/validationSchemas"
        ),
      });
      await requestMapper.addRequest(request);
      await requestMapper.addRequest(request2);
      requestMapper.addRequestHandler({ requestHandler: baseHandler });

      const result = await requestMapper.handleRequest({
        url: "/simple",
        method: HTTPMethods.POST,
        data: { body: "like", query: {}, headers: {} },
      });

      expect(result.body).toEqual({
        data: { body: "like", params: {}, query: {}, headers: {} },
        payload: {
          topic: "simple2",
        },
      });
    });
    it("Adds many complex requests to map and handles it correctly", async () => {
      const request: RequestSchema = {
        url: "/something/very/hard",
        method: HTTPMethods.POST,
        defaultPayloadForRequestHandler: {
          topic: "simple",
        } as PayloadForKafkaHandler,
        validationSchema: "simple",
      };
      const request2 = JSON.parse(JSON.stringify(request)) as RequestSchema;
      request2.url = "/something/very/hard/yes";
      request2.method = HTTPMethods.DELETE;
      request2.defaultPayloadForRequestHandler = {
        topic: "simple",
      } as PayloadForKafkaHandler;
      const request3 = JSON.parse(JSON.stringify(request)) as RequestSchema;
      request3.url = "/something/very/hard/no";

      const requestMapper = new RequestMapper({
        pathToValidationSchemas: path.join(
          __dirname,
          "../tests/validationSchemas"
        ),
      });
      await requestMapper.addRequest(request);
      await requestMapper.addRequest(request2);
      await requestMapper.addRequest(request3);
      requestMapper.addRequestHandler({ requestHandler: baseHandler });

      const result = await requestMapper.handleRequest({
        url: "/something/very/hard/yes",
        method: HTTPMethods.DELETE,
        data: { body: 12, query: {}, headers: {} },
      });

      expect(result.body).toEqual({
        payload: {
          topic: "simple",
        },
        data: {
          body: 12,
          params: {},
          query: {},
          headers: {},
        },
      });
    });
    it("Return Unknown Response if unknown url", async () => {
      const request: RequestSchema = {
        url: "/simple",
        method: HTTPMethods.POST,
        defaultPayloadForRequestHandler: {
          topic: "simple",
        } as PayloadForKafkaHandler,
        validationSchema: "simple",
      };

      const requestMapper = new RequestMapper({
        pathToValidationSchemas: path.join(
          __dirname,
          "../tests/validationSchemas"
        ),
      });
      await requestMapper.addRequest(request);
      requestMapper.addRequestHandler({ requestHandler: baseHandler });

      const result = await requestMapper.handleRequest({
        url: "/who-are-you",
        method: HTTPMethods.POST,
        data: { body: "asdasd", query: {}, headers: {} },
      });
      expect(result).toEqual({
        code: 404,
        body: { errors: ["Unknown request"], success: false },
      });
    });
    it("Returns Unknown Response if method is not supported", async () => {
      const request: RequestSchema = {
        url: "/simple",
        method: HTTPMethods.POST,
        defaultPayloadForRequestHandler: {
          topic: "simple",
        } as PayloadForKafkaHandler,
        validationSchema: "simple",
      };

      const requestMapper = new RequestMapper({
        pathToValidationSchemas: path.join(
          __dirname,
          "../tests/validationSchemas"
        ),
      });
      await requestMapper.addRequest(request);
      requestMapper.addRequestHandler({ requestHandler: baseHandler });

      const result = await requestMapper.handleRequest({
        url: "/simple",
        method: HTTPMethods.DELETE,
        data: { body: "asdasd", query: {}, headers: {} },
      });
      expect(result).toEqual({
        code: 404,
        body: { errors: ["Unknown request"], success: false },
      });
    });
  });
  describe("Request Validation", () => {
    it("Adds simple request to map and handles it correctly without validation if no validationSchema provided", async () => {
      const request: RequestSchema = {
        url: "/simple",
        method: HTTPMethods.POST,
        defaultPayloadForRequestHandler: {
          topic: "simple",
        } as PayloadForKafkaHandler,
      };

      const requestMapper = new RequestMapper({
        pathToValidationSchemas: path.join(
          __dirname,
          "../tests/validationSchemas"
        ),
      });
      await requestMapper.addRequest(request);
      requestMapper.addRequestHandler({ requestHandler: baseHandler });

      const result = await requestMapper.handleRequest({
        url: "/simple",
        method: HTTPMethods.POST,
        data: { body: "chill", query: {}, headers: {} },
      });

      expect(result.body).toEqual({
        data: { body: "chill", params: {}, query: {}, headers: {} },
        payload: {
          topic: "simple",
        },
      });
    });

    it("Throws an error if provided request body is invalid", async () => {
      const request: RequestSchema = {
        url: "/simple",
        method: HTTPMethods.POST,
        defaultPayloadForRequestHandler: {
          topic: "simple",
        } as PayloadForKafkaHandler,
        validationSchema: "simple",
      };

      const requestMapper = new RequestMapper({
        pathToValidationSchemas: path.join(
          __dirname,
          "../tests/validationSchemas"
        ),
      });
      await requestMapper.addRequest(request);
      requestMapper.addRequestHandler({ requestHandler: baseHandler });

      const result = await requestMapper.handleRequest({
        url: "/simple",
        method: HTTPMethods.POST,
        data: { body: "asdasd", query: {}, headers: {} },
      });
      expect(result).toEqual({
        code: 422,
        body: {
          errors: ["parameter: .body should be integer"],
          success: false,
        },
      });
    });
  });
  describe("Request Params", () => {
    it("Adds simple request to map with url params and handles it correctly", async () => {
      const request: RequestSchema = {
        url: "/simple/:id",
        method: HTTPMethods.POST,
        defaultPayloadForRequestHandler: {
          topic: "simple",
        } as PayloadForKafkaHandler,
        validationSchema: "simple",
      };

      const requestMapper = new RequestMapper({
        pathToValidationSchemas: path.join(
          __dirname,
          "../tests/validationSchemas"
        ),
      });
      await requestMapper.addRequest(request);
      requestMapper.addRequestHandler({ requestHandler: baseHandler });

      const result = await requestMapper.handleRequest({
        url: "/simple/someUserId",
        method: HTTPMethods.POST,
        data: { body: 12, query: {}, headers: {} },
      });

      expect(result.body).toEqual({
        payload: {
          topic: "simple",
        },
        data: {
          body: 12,
          params: {
            id: "someUserId",
          },
          query: {},
          headers: {},
        },
      });
    });
  });
  describe("Handler", () => {
    it("Returns internal error response if no handler", async () => {
      const request: RequestSchema = {
        url: "/simple",
        method: HTTPMethods.POST,
        defaultPayloadForRequestHandler: {
          topic: "simple",
        } as PayloadForKafkaHandler,
        validationSchema: "simple",
      };

      const requestMapper = new RequestMapper({
        pathToValidationSchemas: path.join(
          __dirname,
          "../tests/validationSchemas"
        ),
      });
      await requestMapper.addRequest(request);

      const result = await requestMapper.handleRequest({
        url: "/simple",
        method: HTTPMethods.POST,
        data: { body: "asdasd", query: {}, headers: {} },
      });
      expect(result).toEqual({
        code: 500,
        body: { errors: ["Internal Error"], success: false },
      });
    });
    it("Returns responses from last request handler", async () => {
      const returns12Handler: CommunicationStrategy = {
        name: "returns12",
        handleRequest: async (a, b, c, payload: PayloadForKafkaHandler) => {
          if (payload.topic === "someTopic") return { body: 12 };
        },
      } as any;
      const returnsLovelyHandler: CommunicationStrategy = {
        name: "returnsLovely",
        handleRequest: async (
          a,
          b,
          data: { returns12: number },
          payload: PayloadForRequestHandler
        ) => {
          if (
            payload?.headers?.string === "someString" &&
            data.returns12 === 12
          )
            return { body: "lovely" };
        },
      } as any;
      const request: RequestSchema = {
        url: "/simple",
        method: HTTPMethods.POST,
        defaultPayloadForRequestHandler: {},
        validationSchema: "simple",
        requestHandlersSchemas: [
          {
            name: "returns12",
            paramsToExtract: ParamsToExtractFromResponse.AllParams,
            payloadForRequestHandler: {
              topic: "someTopic",
            } as PayloadForKafkaHandler,
          },
          {
            name: "returnsLovely",
            paramsToExtract: ParamsToExtractFromResponse.AllParams,
            payloadForRequestHandler: {
              headers: {
                string: "someString",
              },
            },
          },
        ],
      };

      const requestMapper = new RequestMapper({
        pathToValidationSchemas: path.join(
          __dirname,
          "../tests/validationSchemas"
        ),
        requestHandlersToAdd: [
          { requestHandler: returns12Handler },
          { requestHandler: returnsLovelyHandler },
        ],
      });
      await requestMapper.addRequest(request);

      const result = await requestMapper.handleRequest({
        url: "/simple",
        method: HTTPMethods.POST,
        data: { body: 12, query: {}, headers: {} },
      });

      expect(result.body).toEqual("lovely");
    });
    it("Immediatly returns no content if only provided handler is async", async () => {
      const returns12Handler: CommunicationStrategy = {
        name: "returns12",
        handleRequest: async (data: any, payload: { topic: string }) => {
          if (payload.topic === "someTopic") return { response: 12 };
        },
      } as any;
      const request: RequestSchema = {
        url: "/simple",
        method: HTTPMethods.POST,
        defaultPayloadForRequestHandler: {},
        validationSchema: "simple",
        requestHandlersSchemas: [
          {
            name: "returns12",
            paramsToExtract: ParamsToExtractFromResponse.AllParams,
            payloadForRequestHandler: {
              topic: "someTopic",
            } as PayloadForKafkaHandler,
            shouldNotWaitForRequestCompletion: true,
          },
        ],
      };

      const requestMapper = new RequestMapper({
        pathToValidationSchemas: path.join(
          __dirname,
          "../tests/validationSchemas"
        ),
        requestHandlersToAdd: [{ requestHandler: returns12Handler }],
      });
      await requestMapper.addRequest(request);

      const result = await requestMapper.handleRequest({
        url: "/simple",
        method: HTTPMethods.POST,
        data: { body: 12, query: {}, headers: {} },
      });

      expect(result.body).toEqual({ success: true });
      expect(result.code).toEqual(200);
    });
    it("Immediatly returns no content if only provided handler is async and throwed error", async () => {
      const returns12Handler: CommunicationStrategy = {
        name: "returns12",
        handleRequest: async (data: any, payload: { topic: string }) => {
          throw new Error();
        },
      } as any;
      const request: RequestSchema = {
        url: "/simple",
        method: HTTPMethods.POST,
        defaultPayloadForRequestHandler: {},
        validationSchema: "simple",
        requestHandlersSchemas: [
          {
            name: "returns12",
            paramsToExtract: ParamsToExtractFromResponse.AllParams,
            payloadForRequestHandler: {
              topic: "someTopic",
            } as PayloadForKafkaHandler,
            shouldNotWaitForRequestCompletion: true,
          },
        ],
      };

      const requestMapper = new RequestMapper({
        pathToValidationSchemas: path.join(
          __dirname,
          "../tests/validationSchemas"
        ),
        requestHandlersToAdd: [{ requestHandler: returns12Handler }],
      });
      await requestMapper.addRequest(request);

      const result = await requestMapper.handleRequest({
        url: "/simple",
        method: HTTPMethods.POST,
        data: { body: 12, query: {}, headers: {} },
      });

      expect(result.body).toEqual({ success: true });
      expect(result.code).toEqual(200);
    });
    it("Returns code and response from not last handler if code >= 400", async () => {
      let isLovelyCalled = false;
      const returns12Handler: CommunicationStrategy = {
        name: "returns12",
        handleRequest: async (a, b, c, payload: { topic: string }) => {
          if (payload.topic === "someTopic") return { body: 12, code: 422 };
        },
      } as any;
      const returnsLovelyHandler: CommunicationStrategy = {
        name: "returnsLovely",
        handleRequest: async () => {
          isLovelyCalled = true;
        },
      } as any;
      const request: RequestSchema = {
        url: "/simple",
        method: HTTPMethods.POST,
        defaultPayloadForRequestHandler: {},
        validationSchema: "simple",
        requestHandlersSchemas: [
          {
            name: "returns12",
            paramsToExtract: ParamsToExtractFromResponse.AllParams,
            payloadForRequestHandler: {
              topic: "someTopic",
            } as PayloadForKafkaHandler,
          },
          {
            name: "returnsLovely",
            paramsToExtract: ParamsToExtractFromResponse.AllParams,
            payloadForRequestHandler: {
              headers: {
                string: "someString",
              },
            },
          },
        ],
      };

      const requestMapper = new RequestMapper({
        pathToValidationSchemas: path.join(
          __dirname,
          "../tests/validationSchemas"
        ),
        requestHandlersToAdd: [
          { requestHandler: returns12Handler },
          { requestHandler: returnsLovelyHandler },
        ],
      });
      await requestMapper.addRequest(request);

      const result = await requestMapper.handleRequest({
        url: "/simple",
        method: HTTPMethods.POST,
        data: { body: 12, query: {}, headers: {} },
      });

      expect(result.body).toEqual(12);
      expect(result.code).toEqual(422);
      expect(isLovelyCalled).toBeFalsy;
    });
  });
});
