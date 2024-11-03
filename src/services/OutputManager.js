const fs = require("fs");
const path = require("path");
const os = require("os");
const logger = require("./LoggerService");

module.exports = class OutputManager {
  /**
   * Cria um diretório temporário para salvar arquivos de saída
   * @returns {string} - Caminho do diretório temporário criado
   */
  static createTempDir() {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "pr-reviewer-"));
    logger.info(`Temporary directory created at: ${tempDir}`);
    return tempDir;
  }

  /**
   * Salva as mudanças estruturadas em um arquivo específico
   * @param {Array} changes - Array de mudanças
   * @param {string} outputFolder - Caminho do diretório de saída
   * @returns {string} - Caminho do arquivo de saída criado
   */
  static saveChanges(changes, outputFolder) {
    const outputFilePath = path.join(outputFolder, "pr_changes.txt");
    fs.writeFileSync(outputFilePath, changes.join(""), "utf-8");
    logger.info(`Changes saved at: ${outputFilePath}`);
    return outputFilePath;
  }

  /**
   * Limpa os arquivos e diretórios temporários
   */
  static cleanupTempFiles(tempDirPath) {
    try {
      fs.rmSync(tempDirPath, { recursive: true, force: true });
      logger.info("Temporary files cleaned up");
    } catch (error) {
      logger.error(`Error cleaning up temporary files: ${error.message}`);
      throw error;
    }
  }
};
