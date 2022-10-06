import pino, {
  Logger as PinoLogger,
  LoggerOptions as PinoLoggerOptions,
} from "pino";
import { ParsedJSON } from "./json";

type DataToLog = { message: string; payload?: Record<string, ParsedJSON> };

enum LogLevel {
  INFO = "info",
  ERROR = "error",
  WARN = "warn",
}

class Logger {
  private readonly pino: PinoLogger<PinoLoggerOptions>;
  private constructor(private readonly name: string) {
    this.pino = pino(this.getConfig());
  }

  [LogLevel.ERROR](data: DataToLog) {
    this.log(LogLevel.ERROR, data);
  }
  [LogLevel.INFO](data: DataToLog) {
    this.log(LogLevel.INFO, data);
  }
  [LogLevel.WARN](data: DataToLog) {
    this.log(LogLevel.WARN, data);
  }

  private getConfig() {
    if (process.env.ENV === "DEV") {
      return {
        transport: {
          target: "pino-pretty",
        },
      };
    }
    return {};
  }
  private log(level: LogLevel, data: DataToLog) {
    this.pino[level]({ ...data.payload, loggerName: this.name }, data.message);
  }

  static loggers: Record<string, Logger> = {};

  static getLogger(name: string = "app-logger") {
    if (!(name in this.loggers)) {
      this.loggers[name] = new Logger(name);
    }
    return this.loggers[name];
  }
}
