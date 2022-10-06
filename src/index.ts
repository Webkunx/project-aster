import { Response } from "./core/response";
import { KafkaCommunicationStrategy } from "./core/communication-strategies/kafka.communication-strategy";
import { fastify } from "fastify";
import { RequestMapper } from "./core/request-mapper";
import { readFile } from "fs/promises";
import path from "path";
import { HTTPMethods } from "./core/http-methods";
import { ParsedJSON } from "./common/parsed-json";

const server = fastify();

const requestMapper = new RequestMapper({
  pathToValidationSchemas: path.join(__dirname, "../schemas/validation"),
});

server.route({
  method: ["GET", "POST", "PUT", "DELETE"],
  url: "/*",
  handler: async (request, reply) => {
    try {
      const response: Response = await requestMapper.handleRequest({
        url: request.url,
        method: request.method as HTTPMethods,
        data: {
          body: request.body as ParsedJSON,
        },
      });

      return reply.code(response.code).send(response.body);
    } catch (error) {
      console.log(error);
    }

    return { success: true };
  },
});

server.listen(process.env.PORT || 3000, async (err, address) => {
  const kafkaCommunicationStrategy = new KafkaCommunicationStrategy();
  await kafkaCommunicationStrategy.init();
  requestMapper.addRequestHandler({
    requestHandler: kafkaCommunicationStrategy,
  });
  if (err) {
    console.error(err);
    process.exit(1);
  }
  const request = JSON.parse(
    await readFile(
      path.join(__dirname, "../schemas/requests/login.json"),
      "utf-8"
    )
  );

  requestMapper.addRequest(request);

  console.log(`Server listening at ${address}`);
});
