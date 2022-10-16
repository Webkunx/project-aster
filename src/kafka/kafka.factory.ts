import LZ4 from "kafkajs-lz4";
import { CompressionTypes, CompressionCodecs, Kafka } from "kafkajs";

// TODO MY LOGGER
const kafkaFactory = (brokers: string[]): Kafka => {
  CompressionCodecs[CompressionTypes.LZ4] = new LZ4().codec;
  return new Kafka({
    clientId: "my-app",
    brokers,
  });
};

export { kafkaFactory };
