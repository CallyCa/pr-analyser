const LLMAdapter = require("../../adapters/LLMAdapter");
const fs = require("fs").promises;
const OpenAI = require("openai");
const logger = require("../../services/LoggerService");

jest.mock("fs", () => {
  const originalModule = jest.requireActual("fs");
  return {
    ...originalModule,
    promises: {
      readFile: jest.fn(),
      writeFile: jest.fn(),
    },
  };
});
jest.mock("openai");
jest.mock("../../services/LoggerService", () => ({
  info: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
}));

jest.mock("../../../config/prompts.config", () => ({
  PROMPTS: {
    review: "Mock review prompt",
    description: "Mock description prompt",
  },
}));

describe("LLMAdapter", () => {
  let llmAdapter;

  beforeEach(() => {
    llmAdapter = new LLMAdapter("fake_api_key");
    fs.readFile.mockClear();
    fs.writeFile.mockClear();
    logger.info.mockClear();
    logger.error.mockClear();
  });

  it("should process changes and return output path", async () => {
    fs.readFile.mockResolvedValue("Mock file content");
    const mockResponse = {
      choices: [{ message: { content: "Mock LLM output" } }],
    };
    OpenAI.prototype.chat = {
      completions: { create: jest.fn().mockResolvedValue(mockResponse) },
    };

    const result = await llmAdapter.processChanges(
      "/path/to/changes.txt",
      "review",
      "/output/folder",
    );
    expect(result).toBe("/output/folder/output_review.txt");
    expect(fs.writeFile).toHaveBeenCalledWith(
      "/output/folder/output_review.txt",
      "Mock LLM output",
      "utf-8",
    );
    expect(logger.info).toHaveBeenCalledWith(
      expect.stringContaining("LLM response saved"),
    );
  });

  it("should throw an error if the file reading fails", async () => {
    fs.readFile.mockRejectedValue(new Error("Mock read error"));

    await expect(
      llmAdapter.processChanges("/invalid/path", "review", "/output/folder"),
    ).rejects.toThrow("Mock read error");
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining("Error processing LLM response"),
    );
  });
});
