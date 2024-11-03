const PRMain = require("../../commands/PRMain");
const logger = require("../../services/LoggerService");
const GitOperator = require("../../services/GitOperator");
const fs = require("fs");
const { PROMPTS } = require("../../../config/prompts.config");

jest.mock("../../services/GitOperator");
jest.mock("fs");
jest.mock("../../services/LoggerService", () => ({
  info: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
}));
jest.mock("../../adapters/LLMAdapter", () => {
  return jest.fn().mockImplementation(() => ({
    processChanges: jest
      .fn()
      .mockResolvedValue("/output/folder/output_review.txt"),
  }));
});

jest
  .spyOn(PRMain.prototype, "getRemoteBranches")
  .mockResolvedValue(["origin/main", "origin/develop"]);

describe("PRMain Integration", () => {
  let prReviewer;

  beforeEach(() => {
    prReviewer = new PRMain({
      branch: "feature/test-branch",
      mode: "review",
      targetBranch: "main",
      output: "/output/folder",
    });

    GitOperator.fetchLatestChanges.mockClear();
    GitOperator.checkoutBranch.mockClear();
    GitOperator.generateDiff.mockClear();
    fs.writeFileSync.mockClear();
    logger.info.mockClear();
    logger.error.mockClear();
  });

  it("should complete the PR review process without errors and use the correct prompt", async () => {
    GitOperator.generateDiff.mockReturnValue("Mock diff content");
    fs.writeFileSync.mockImplementation(() => {});

    const result = await prReviewer.run();

    expect(result).toBeDefined();
    expect(GitOperator.fetchLatestChanges).toHaveBeenCalled();
    expect(GitOperator.checkoutBranch).toHaveBeenCalledWith(
      "feature/test-branch",
    );
    expect(logger.info).toHaveBeenCalledWith(
      expect.stringContaining("Review saved at"),
    );

    expect(PROMPTS.review).toContain("You are a code reviewer.");
  });
});
