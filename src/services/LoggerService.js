const winston = require("winston");

class LoggerService {
  constructor() {
    if (!LoggerService.instance) {
      this.logger = winston.createLogger({
        level: "info",
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.colorize(),
          winston.format.printf(({ level, message, timestamp }) => {
            return `${timestamp} ${level}: ${message}`;
          }),
        ),
        transports: [
          new winston.transports.Console(),
          new winston.transports.File({
            filename: "logs/error.log",
            level: "error",
          }),
          new winston.transports.File({ filename: "logs/combined.log" }),
        ],
      });
      LoggerService.instance = this; // Guarda a instância
    }

    return LoggerService.instance; // Retorna a instância
  }

  info(message) {
    this.logger.info(message);
  }

  error(message) {
    this.logger.error(message);
  }

  debug(message) {
    this.logger.debug(message);
  }

  enableVerbose() {
    this.logger.level = "debug";
  }
}

// Exporta a instância única da LoggerService
module.exports = new LoggerService();
