const OutputManager = require("../../services/OutputManager");
const fs = require("fs");
const os = require("os");
const path = require("path");

jest.mock("fs");
jest.mock("os");
jest.mock("../../services/LoggerService", () => ({
  info: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
}));

describe("OutputManager", () => {
  beforeEach(() => {
    fs.mkdtempSync.mockClear();
    fs.writeFileSync.mockClear();
    fs.rmSync.mockClear();
  });

  it("should create a temporary directory", () => {
    const tempDirPath = "/tmp/pr-reviewer-12345";
    os.tmpdir.mockReturnValue("/tmp");
    fs.mkdtempSync.mockReturnValue(tempDirPath);

    const result = OutputManager.createTempDir();
    expect(fs.mkdtempSync).toHaveBeenCalledWith(
      path.join("/tmp", "pr-reviewer-"),
    );
    expect(result).toBe(tempDirPath);
  });

  it("should save changes to a specified output file", () => {
    const changes = ["Added: Line 1", "Removed: Line 2"];
    const outputFolder = "/output/folder";
    const outputPath = path.join(outputFolder, "pr_changes.txt");

    OutputManager.saveChanges(changes, outputFolder);
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      outputPath,
      changes.join(""),
      "utf-8",
    );
  });

  it("should clean up temporary files without errors", () => {
    const tempDirPath = "/tmp/pr-reviewer-12345";
    fs.rmSync.mockImplementation(() => {});

    expect(() => OutputManager.cleanupTempFiles(tempDirPath)).not.toThrow();
    expect(fs.rmSync).toHaveBeenCalledWith(tempDirPath, {
      recursive: true,
      force: true,
    });
  });

  it("should handle errors when saving changes", () => {
    fs.writeFileSync.mockImplementation(() => {
      throw new Error("Mock write error");
    });

    expect(() => {
      OutputManager.saveChanges(["Test"], "/invalid/path");
    }).toThrow("Mock write error");
  });
});
