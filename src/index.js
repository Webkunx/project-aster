"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = require("fastify");
const kafkajs_1 = require("kafkajs");
const events_1 = __importDefault(require("events"));
const uuid_1 = require("uuid");
const eventEmitter = new events_1.default();
const server = (0, fastify_1.fastify)();
const kafka = new kafkajs_1.Kafka({
    clientId: "my-app",
    brokers: ["localhost:29092"],
});
const consumer = kafka.consumer({ groupId: "gw-group" });
const producer = kafka.producer();
server.get("/ping", async (request, reply) => {
    return { success: true, timestamp: Date.now() };
});
//
server.get("/service", async (request, reply) => {
    const result = await new Promise(async (res) => {
        const id = (0, uuid_1.v4)();
        eventEmitter.on(id, (data) => {
            res(data);
            eventEmitter.removeListener(id, () => { });
        });
        await producer.send({
            topic: "api-gw-requests",
            messages: [
                {
                    value: JSON.stringify({
                        headers: { id },
                    }),
                },
            ],
        });
    });
    return result;
});
server.listen(process.env.PORT || 4000, async (err, address) => {
    await consumer.connect();
    await consumer.subscribe({ topic: "api-gw-responses", fromBeginning: true });
    await consumer.run({
        eachMessage: async (payload) => {
            var _a;
            const { message: rawMessage } = payload;
            const stringifiedMessage = (_a = rawMessage === null || rawMessage === void 0 ? void 0 : rawMessage.value) === null || _a === void 0 ? void 0 : _a.toString();
            if (!stringifiedMessage)
                return;
            const { headers, data } = JSON.parse(stringifiedMessage);
            eventEmitter.emit(headers.id, data);
        },
    });
    await producer.connect();
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening at ${address}`);
});
