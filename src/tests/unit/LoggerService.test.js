const LoggerService = require("../../services/LoggerService");
const winston = require("winston");

jest.mock("winston", () => {
  const actualWinston = jest.requireActual("winston");
  return {
    ...actualWinston,
    createLogger: jest.fn(() => ({
      info: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      level: "info",
    })),
  };
});

describe("LoggerService", () => {
  let loggerService;

  beforeEach(() => {
    winston.createLogger.mockClear();
    loggerService = new LoggerService();
  });

  it("should log info messages", () => {
    const infoSpy = jest.spyOn(loggerService.logger, "info");

    loggerService.info("Test info message");
    expect(infoSpy).toHaveBeenCalledWith("Test info message");
  });

  it("should log error messages", () => {
    const errorSpy = jest.spyOn(loggerService.logger, "error");

    loggerService.error("Test error message");
    expect(errorSpy).toHaveBeenCalledWith("Test error message");
  });

  it("should log debug messages when verbose mode is enabled", () => {
    const debugSpy = jest.spyOn(loggerService.logger, "debug");

    loggerService.enableVerbose();
    expect(loggerService.logger.level).toBe("debug");

    loggerService.debug("Test debug message");
    expect(debugSpy).toHaveBeenCalledWith("Test debug message");
  });

  it("should create only one instance of LoggerService", () => {
    const anotherInstance = new LoggerService();
    expect(loggerService).toBe(anotherInstance);
  });
});
