import path from "path";
import { HTTPMethods } from "../src/core/http-methods";
import { RequestMapper } from "../src/core/request-mapper";
import { RequestSchema } from "../src/core/request-schema";
import { BaseCommunicationStrategy } from "../src/core/communication-strategies/base.communication-strategy";

const baseHandler = new BaseCommunicationStrategy();

// STEPS
// update request
// multiple handlers
// part key
describe("RequestMapper", () => {
  describe("Routing", () => {
    it("Adds simple request to map and handles it correctly", async () => {
      const request: RequestSchema = {
        url: "/simple",
        method: HTTPMethods.POST,
        payloadForRequestHandler: {
          topic: "simple",
          messageName: "SimpleMessage",
        },
        validationSchema: "simple",
      };

      const requestMapper = new RequestMapper({
        pathToValidationSchemas: path.join(
          __dirname,
          "../tests/validationSchemas"
        ),
      });
      await requestMapper.addRequest(request);
      requestMapper.addHandler(baseHandler);

      const result = await requestMapper.handleRequest({
        url: "/simple",
        method: HTTPMethods.POST,
        data: { simple: 12 },
      });

      expect(result.response).toEqual({
        data: { simple: 12, params: {} },
        payload: {
          topic: "simple",
          messageName: "SimpleMessage",
        },
      });
    });
    it("Adds many complex requests to map and handles it correctly", async () => {
      const request: RequestSchema = {
        url: "/something/very/hard",
        method: HTTPMethods.POST,
        payloadForRequestHandler: {
          topic: "simple",
          messageName: "SimpleMessage",
        },
        validationSchema: "simple",
      };
      const request2 = JSON.parse(JSON.stringify(request)) as RequestSchema;
      request2.url = "/something/very/hard/yes";
      request2.method = HTTPMethods.DELETE;
      request2.payloadForRequestHandler = {
        messageName: "UniqueMessage",
        topic: "simple",
      };
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
      requestMapper.addHandler(baseHandler);

      const result = await requestMapper.handleRequest({
        url: "/something/very/hard/yes",
        method: HTTPMethods.DELETE,
        data: { simple: 12 },
      });

      expect(result.response).toEqual({
        payload: {
          topic: "simple",
          messageName: "UniqueMessage",
        },
        data: {
          simple: 12,
          params: {},
        },
      });
    });
    it("Throws an error if unknown url", async () => {
      const request: RequestSchema = {
        url: "/simple",
        method: HTTPMethods.POST,
        payloadForRequestHandler: {
          topic: "simple",
          messageName: "SimpleMessage",
        },
        validationSchema: "simple",
      };

      const requestMapper = new RequestMapper({
        pathToValidationSchemas: path.join(
          __dirname,
          "../tests/validationSchemas"
        ),
      });
      await requestMapper.addRequest(request);
      requestMapper.addHandler(baseHandler);

      try {
        await requestMapper.handleRequest({
          url: "/who-are-you",
          method: HTTPMethods.POST,
          data: { simple: "asdasd" },
        });
        expect(false).toBeTruthy();
      } catch (e) {
        expect((e as Error).message).toBe("Unknown request");
      }
    });
    it("Throws an error if unknown method", async () => {
      const request: RequestSchema = {
        url: "/simple",
        method: HTTPMethods.POST,
        payloadForRequestHandler: {
          topic: "simple",
          messageName: "SimpleMessage",
        },
        validationSchema: "simple",
      };

      const requestMapper = new RequestMapper({
        pathToValidationSchemas: path.join(
          __dirname,
          "../tests/validationSchemas"
        ),
      });
      await requestMapper.addRequest(request);
      requestMapper.addHandler(baseHandler);

      try {
        await requestMapper.handleRequest({
          url: "/simple",
          method: HTTPMethods.DELETE,
          data: { simple: "asdasd" },
        });
        expect(false).toBeTruthy();
      } catch (e) {
        expect((e as Error).message).toBe("Unknown request");
      }
    });
  });
  describe("Request Validation", () => {
    it("Adds simple request to map and handles it correctly without validation if no validationSchema provided", async () => {
      const request: RequestSchema = {
        url: "/simple",
        method: HTTPMethods.POST,
        payloadForRequestHandler: {
          topic: "simple",
          messageName: "SimpleMessage",
        },
      };

      const requestMapper = new RequestMapper({
        pathToValidationSchemas: path.join(
          __dirname,
          "../tests/validationSchemas"
        ),
      });
      await requestMapper.addRequest(request);
      requestMapper.addHandler(baseHandler);

      const result = await requestMapper.handleRequest({
        url: "/simple",
        method: HTTPMethods.POST,
        data: { simple: "chill" },
      });

      expect(result.response).toEqual({
        data: { simple: "chill", params: {} },
        payload: {
          topic: "simple",
          messageName: "SimpleMessage",
        },
      });
    });

    it("Throws an error if provided request body is invalid", async () => {
      const request: RequestSchema = {
        url: "/simple",
        method: HTTPMethods.POST,
        payloadForRequestHandler: {
          topic: "simple",
          messageName: "SimpleMessage",
        },
        validationSchema: "simple",
      };

      const requestMapper = new RequestMapper({
        pathToValidationSchemas: path.join(
          __dirname,
          "../tests/validationSchemas"
        ),
      });
      await requestMapper.addRequest(request);
      requestMapper.addHandler(baseHandler);

      try {
        await requestMapper.handleRequest({
          url: "/simple",
          method: HTTPMethods.POST,
          data: { simple: "asdasd" },
        });
        expect(false).toBeTruthy();
      } catch (e) {
        expect((e as Error).message).toBe("Invalid request");
      }
    });
  });
  describe("Request Params", () => {
    it("Adds simple request to map with url params and handles it correctly", async () => {
      const request: RequestSchema = {
        url: "/simple/:id",
        method: HTTPMethods.POST,
        payloadForRequestHandler: {
          topic: "simple",
          messageName: "SimpleMessage",
        },
        validationSchema: "simple",
      };

      const requestMapper = new RequestMapper({
        pathToValidationSchemas: path.join(
          __dirname,
          "../tests/validationSchemas"
        ),
      });
      await requestMapper.addRequest(request);
      requestMapper.addHandler(baseHandler);

      const result = await requestMapper.handleRequest({
        url: "/simple/someUserId",
        method: HTTPMethods.POST,
        data: { simple: 12 },
      });

      expect(result.response).toEqual({
        payload: {
          topic: "simple",
          messageName: "SimpleMessage",
        },
        data: {
          simple: 12,
          params: {
            id: "someUserId",
          },
        },
      });
    });
  });
  describe("Handler Validation", () => {
    it("Throws an error if request handler were provided", async () => {
      const request: RequestSchema = {
        url: "/simple",
        method: HTTPMethods.POST,
        payloadForRequestHandler: {
          topic: "simple",
          messageName: "SimpleMessage",
        },
        validationSchema: "simple",
      };

      const requestMapper = new RequestMapper({
        pathToValidationSchemas: path.join(
          __dirname,
          "../tests/validationSchemas"
        ),
      });
      await requestMapper.addRequest(request);

      try {
        await requestMapper.handleRequest({
          url: "/simple",
          method: HTTPMethods.POST,
          data: { simple: "asdasd" },
        });
        expect(false).toBeTruthy();
      } catch (e) {
        expect((e as Error).message).toBe("no request handler");
      }
    });
  });
});
