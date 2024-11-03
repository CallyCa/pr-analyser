const fs = require("fs");
const logger = require("./LoggerService");

module.exports = class DiffParser {
  /**
   * Método para parsear o conteúdo do diff
   * @param {string} diffContent - Conteúdo do diff
   * @returns {Array} - Array de strings estruturadas com as mudanças
   */
  static parseDiff(diffContent) {
    const changes = [];
    let currentFile = null;
    const diffLines = diffContent.split("\n");

    diffLines.forEach((line) => {
      const trimmedLine = line.trim();

      if (trimmedLine.startsWith("diff --git")) {
        currentFile = trimmedLine.split(" ")[2].replace("a/", "");
        changes.push(`\nChanges in file: ${currentFile}\n`);
      } else if (
        trimmedLine.startsWith("+") &&
        !trimmedLine.startsWith("+++")
      ) {
        changes.push(`Added: ${trimmedLine.slice(1).trim()}\n`);
      } else if (
        trimmedLine.startsWith("-") &&
        !trimmedLine.startsWith("---")
      ) {
        changes.push(`Removed: ${trimmedLine.slice(1).trim()}\n`);
      }
    });

    return changes;
  }

  /**
   * Método para salvar as mudanças estruturadas em um arquivo
   * @param {Array} changes - Array com as mudanças
   * @param {string} outputFilePath - Caminho do arquivo de saída
   */
  static saveChangesForLLM(changes, outputFilePath) {
    try {
      fs.writeFileSync(outputFilePath, changes.join(""), "utf-8");
      logger.info(`Structured changes saved to ${outputFilePath}`);
    } catch (error) {
      logger.error(`Failed to save changes: ${error.message}`);
      throw error;
    }
  }
};
