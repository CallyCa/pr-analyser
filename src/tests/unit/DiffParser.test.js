const DiffParser = require("../../services/DiffParser");
const fs = require("fs");

jest.mock("fs");
jest.mock("../../services/LoggerService", () => ({
  info: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
}));

describe("DiffParser", () => {
  beforeEach(() => {
    fs.writeFileSync.mockClear();
  });

  it("should correctly parse a simple diff", () => {
    const diffContent = `
  diff --git a/file.txt b/file.txt
  + Added line
  - Removed line
    `;
    const result = DiffParser.parseDiff(diffContent);

    expect(result).toEqual([
      "\nChanges in file: file.txt\n",
      "Added: Added line\n",
      "Removed: Removed line\n",
    ]);
  });

  it("should save parsed changes to a file", () => {
    const changes = ["Added: Line 1", "Removed: Line 2"];
    const filePath = "/path/to/output.txt";
    DiffParser.saveChangesForLLM(changes, filePath);

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      filePath,
      "Added: Line 1Removed: Line 2",
      "utf-8",
    );
  });

  it("should throw an error if saving changes fails", () => {
    fs.writeFileSync.mockImplementation(() => {
      throw new Error("Mock write error");
    });

    expect(() => {
      DiffParser.saveChangesForLLM(["Test"], "/invalid/path");
    }).toThrow("Mock write error");
  });
});
