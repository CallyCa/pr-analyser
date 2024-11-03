const GitOperator = require("../../services/GitOperator");
const { execSync } = require("child_process");
const logger = require("../../services/LoggerService");

jest.mock("child_process");
jest.mock("../../services/LoggerService", () => ({
  info: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
}));

describe("GitOperator", () => {
  beforeEach(() => {
    execSync.mockClear();
    logger.info.mockClear();
    logger.error.mockClear();
    logger.debug.mockClear();
  });

  it("should execute Git commands without errors", () => {
    execSync.mockImplementation(() => "Mock output");

    expect(() => GitOperator.checkoutBranch("main")).not.toThrow();
    expect(execSync).toHaveBeenCalledWith("git checkout main", {
      encoding: "utf8",
      stdio: "pipe",
    });
    expect(logger.info).toHaveBeenCalledWith("Checking out branch: main");
  });

  it("should throw an error if a Git command fails", () => {
    execSync.mockImplementation(() => {
      throw new Error("Mock Git error");
    });

    expect(() => GitOperator.fetchLatestChanges()).toThrow(
      "Git command failed: Mock Git error",
    );
    expect(logger.error).toHaveBeenCalledWith(
      "Git command failed: Mock Git error",
    );
  });

  it("should log debug information for Git command execution", () => {
    execSync.mockImplementation(() => "Mock output");

    GitOperator.executeGitCommand("git status");
    expect(logger.debug).toHaveBeenCalledWith(
      "Executing Git command: git status",
    );
  });

  it("should fetch latest changes including submodules", () => {
    execSync.mockImplementation(() => "Mock output");

    GitOperator.fetchLatestChanges();

    expect(execSync).toHaveBeenCalledWith("git fetch --recurse-submodules", {
      encoding: "utf8",
      stdio: "pipe",
    });
    expect(logger.info).toHaveBeenCalledWith("Fetching latest changes...");
  });

  it("should update submodules after checking out a branch", () => {
    execSync.mockImplementation(() => "Mock output");

    GitOperator.checkoutBranch("main");

    expect(execSync).toHaveBeenCalledWith("git checkout main", {
      encoding: "utf8",
      stdio: "pipe",
    });
    expect(execSync).toHaveBeenCalledWith(
      "git submodule update --init --recursive",
      {
        encoding: "utf8",
        stdio: "pipe",
      },
    );
    expect(logger.info).toHaveBeenCalledWith("Updating submodules...");
  });
});
