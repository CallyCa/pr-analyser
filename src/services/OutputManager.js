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
    
    // Verifica se o diretório foi realmente criado
    if (!fs.existsSync(tempDir)) {
      logger.error(`Failed to create temporary directory at: ${tempDir}`);
      throw new Error(`Temporary directory not found after creation: ${tempDir}`);
    }
    
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

    // Verifica se o diretório de saída existe
    if (!fs.existsSync(outputFolder)) {
      logger.error(`Output directory does not exist: ${outputFolder}`);
      throw new Error(`Output directory not found: ${outputFolder}`);
    }

    try {
      logger.info(`Saving changes to: ${outputFilePath}`);
      fs.writeFileSync(outputFilePath, changes.join(""), "utf-8");
      logger.info(`Changes successfully saved at: ${outputFilePath}`);
    } catch (error) {
      logger.error(`Failed to save changes: ${error.message}`);
      throw error;
    }

    return outputFilePath;
  }

  /**
   * Limpa os arquivos e diretórios temporários, com opção de manter os arquivos
   * @param {string} tempDirPath - Caminho do diretório temporário a ser limpo
   * @param {boolean} [keepFiles=false] - Se verdadeiro, os arquivos não serão deletados
   */
  static cleanupTempFiles(tempDirPath, keepFiles = false) {
    if (keepFiles) {
      logger.info(`Temporary files retained at: ${tempDirPath}`);
      return;
    }

    try {
      if (fs.existsSync(tempDirPath)) {
        fs.rmSync(tempDirPath, { recursive: true, force: true });
        logger.info("Temporary files cleaned up");
      } else {
        logger.warn(`Temporary directory not found for cleanup: ${tempDirPath}`);
      }
    } catch (error) {
      logger.error(`Error cleaning up temporary files: ${error.message}`);
      throw error;
    }
  }
};
