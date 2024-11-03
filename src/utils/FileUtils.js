const fs = require("fs");

module.exports = class FileUtils {
  /**
   * Verifica se um arquivo existe
   * @param {string} filePath - Caminho do arquivo
   * @returns {boolean} - True se o arquivo existe, false caso contrário
   */
  static fileExists(filePath) {
    return fs.existsSync(filePath);
  }

  /**
   * Lê o conteúdo de um arquivo
   * @param {string} filePath - Caminho do arquivo
   * @returns {string} - Conteúdo do arquivo
   */
  static readFile(filePath) {
    return fs.readFileSync(filePath, "utf-8");
  }

  /**
   * Escreve conteúdo em um arquivo
   * @param {string} filePath - Caminho do arquivo
   * @param {string} content - Conteúdo a ser escrito
   */
  static writeFile(filePath, content) {
    fs.writeFileSync(filePath, content, "utf-8");
  }
};
