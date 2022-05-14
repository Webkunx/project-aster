import { Kafka } from "kafkajs";

import { CompressionTypes, CompressionCodecs } from "kafkajs";

const kafkaFactory = (brokers: string[]): Kafka => {
  const LZ4 = require("kafkajs-lz4");
  CompressionCodecs[CompressionTypes.LZ4] = new LZ4().codec;
  return new Kafka({
    clientId: "my-app",
    brokers,
  });
};

export { kafkaFactory };
