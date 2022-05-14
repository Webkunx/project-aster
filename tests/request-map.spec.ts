import path from "path";
import {
  HttpMethods,
  RequestMapper,
  RequestToAdd,
} from "../src/core/request-mapper";

const baseHandler = (data: any) => data;

// STEPS
// update request
// multiple handlers
// part key
describe("RequestMapper", () => {
  it("Adds simple request to map and handles it correctly", async () => {
    const request: RequestToAdd = {
      url: "/simple",
      method: HttpMethods.POST,
      topic: "simple",
      messageName: "SimpleMessage",
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
      method: HttpMethods.POST,
      data: { simple: 12 },
    });

    expect(result).toEqual({
      topic: "simple",
      messageName: "SimpleMessage",
      data: { simple: 12 },
      partitionKey: undefined,
    });
  });
  it("Adds simple request to map with url params and handles it correctly", async () => {
    const request: RequestToAdd = {
      url: "/simple/:id",
      method: HttpMethods.POST,
      topic: "simple",
      messageName: "SimpleMessage",
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
      method: HttpMethods.POST,
      data: { simple: 12 },
    });

    expect(result).toEqual({
      topic: "simple",
      messageName: "SimpleMessage",
      data: {
        simple: 12,
        params: {
          id: "someUserId",
        },
      },
      partitionKey: undefined,
    });
  });
  it("Adds simple request to map and handles it correctly without validation if no validationSchema provided", async () => {
    const request: RequestToAdd = {
      url: "/simple",
      method: HttpMethods.POST,
      topic: "simple",
      messageName: "SimpleMessage",
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
      method: HttpMethods.POST,
      data: { simple: "chill" },
    });

    expect(result).toEqual({
      topic: "simple",
      messageName: "SimpleMessage",
      data: { simple: "chill" },
      partitionKey: undefined,
    });
  });
  it("Adds hard request to map and handles it correctly", async () => {
    const request: RequestToAdd = {
      url: "/something/very/hard",
      method: HttpMethods.POST,
      topic: "simple",
      messageName: "SimpleMessage",
      validationSchema: "simple",
    };
    const request2 = JSON.parse(JSON.stringify(request)) as RequestToAdd;
    request2.url = "/something/very/hard/yes";
    request2.method = HttpMethods.DELETE;
    request2.messageName = "UniqueMessage";
    const request3 = JSON.parse(JSON.stringify(request)) as RequestToAdd;
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
      method: HttpMethods.DELETE,
      data: { simple: 12 },
    });

    expect(result).toEqual({
      topic: "simple",
      messageName: "UniqueMessage",
      data: { simple: 12 },
    });
  });
  it("Throws an error if provided request body is invalid", async () => {
    const request: RequestToAdd = {
      url: "/simple",
      method: HttpMethods.POST,
      topic: "simple",
      messageName: "SimpleMessage",
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
        method: HttpMethods.POST,
        data: { simple: "asdasd" },
      });
      expect(false).toBeTruthy();
    } catch (e) {
      expect((e as Error).message).toBe("Invalid request");
    }
  });
  it("Throws an error if unknown url", async () => {
    const request: RequestToAdd = {
      url: "/simple",
      method: HttpMethods.POST,
      topic: "simple",
      messageName: "SimpleMessage",
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
        method: HttpMethods.POST,
        data: { simple: "asdasd" },
      });
      expect(false).toBeTruthy();
    } catch (e) {
      expect((e as Error).message).toBe("Unknown request");
    }
  });
  it("Throws an error if unknown method", async () => {
    const request: RequestToAdd = {
      url: "/simple",
      method: HttpMethods.POST,
      topic: "simple",
      messageName: "SimpleMessage",
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
        method: HttpMethods.DELETE,
        data: { simple: "asdasd" },
      });
      expect(false).toBeTruthy();
    } catch (e) {
      expect((e as Error).message).toBe("Unknown request");
    }
  });
  it("Throws an error if request handler were provided", async () => {
    const request: RequestToAdd = {
      url: "/simple",
      method: HttpMethods.POST,
      topic: "simple",
      messageName: "SimpleMessage",
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
        method: HttpMethods.POST,
        data: { simple: "asdasd" },
      });
      expect(false).toBeTruthy();
    } catch (e) {
      expect((e as Error).message).toBe("no request handler");
    }
  });
});
