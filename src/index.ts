import { fastify } from "fastify";
import { kafkaFactory } from "./kafka/kafka.factory";
import { MessageConsumer } from "./kafka/consumer.factory";
import { MessageProducer } from "./kafka/message-producer";
import { Message } from "./kafka/message";
import { HttpMethods, RequestMapper } from "./core/request-mapper";
import { readFile } from "fs/promises";
import path from "path";

const server = fastify();
// const kafka = kafkaFactory(["localhost:29092"]);
// const consumer = new MessageConsumer(kafka.consumer());
// const producer = new MessageProducer(kafka.producer());

const requestMapper = new RequestMapper({
  pathToValidationSchemas: path.join(__dirname, "../schemas/validation"),
});
requestMapper.addHandler((data) => console.log(JSON.stringify(data)));

// server.get("/ping", async (request, reply) => {
//   return { success: true, timestamp: Date.now() };
// });

server.route({
  method: ["GET", "POST", "PUT", "DELETE"],
  url: "/*",
  handler: async (request, reply) => {
    try {
      await requestMapper.handleRequest({
        url: request.url,
        method: request.method as HttpMethods,
        data: {
          body: request.body,
        },
      });
    } catch (error) {
      console.log(error);
    }

    return { success: true };
  },
});

// server.get("/service", async (request, reply) => {
//   const result = await new Promise(async (res) => {
//     const message = Message.messageWithCorrelationId({});
//     const id = message.getCorrelationId();
//     consumer.on(id, (data: Message) => {
//       res(data);
//       consumer.removeListener(id, () => {});
//     });
//     await producer.send(message);
//   });
//   return result;
// });

server.listen(process.env.PORT || 4000, async (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  // await consumer.init();
  // await producer.init();
  const request = JSON.parse(
    await readFile(
      path.join(__dirname, "../schemas/requests/login.json"),
      "utf-8"
    )
  );

  requestMapper.addRequest(request);

  console.log(`Server listening at ${address}`);
});
