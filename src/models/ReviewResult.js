module.exports = class ReviewResult {
  /**
   * @param {string} mode - Modo de revisão (ex: "review", "description")
   * @param {string} outputPath - Caminho para o arquivo de saída
   * @param {string} content - Conteúdo gerado pelo LLM
   */
  constructor(mode, outputPath, content) {
    this.mode = mode;
    this.outputPath = outputPath;
    this.content = content;
  }

  /**
   * Retorna uma representação formatada do resultado
   * @returns {string} - Representação do resultado
   */
  toString() {
    return `Mode: ${this.mode}\nOutput Path: ${this.outputPath}\nContent: ${this.content}`;
  }
};
