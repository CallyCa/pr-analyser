const GitOperator = require("../services/GitOperator");
const DiffParser = require("../services/DiffParser");
const LLMAdapter = require("../adapters/LLMAdapter");
const OutputManager = require("../services/OutputManager");
const logger = require("../services/LoggerService");

module.exports = class PRMain {
  constructor(options) {
    this.branchName = options.branch;
    this.mode = options.mode;
    this.targetBranch = options.targetBranch;
    this.outputFolder = options.output || OutputManager.createTempDir();
  }

  // Dentro da classe PRMain
// Modificação para manter os arquivos temporários durante testes/debug
  async run() {
    const tempDirPath = this.outputFolder;
    try {
      logger.info("Starting PR review process...");

      // Operações Git
      GitOperator.fetchLatestChanges();
      GitOperator.checkoutBranch(this.branchName);

      // Verifica se a branch remota alvo existe
      const branches = await this.getRemoteBranches();
      if (!branches.includes(`origin/${this.targetBranch}`)) {
        throw new Error(`Target branch 'origin/${this.targetBranch}' does not exist.`);
      }

      // Gera e parseia o diff com a referência remota
      const diffOutput = GitOperator.generateDiff(`origin/${this.targetBranch}`);
      const parsedChanges = DiffParser.parseDiff(diffOutput);
      const changesFilePath = OutputManager.saveChanges(
        parsedChanges,
        tempDirPath
      );

      // Processar com LLM
      const llmAdapter = new LLMAdapter();
      const reviewFilePath = await llmAdapter.processChanges(
        changesFilePath,
        this.mode,
        tempDirPath
      );

      logger.info(`Review saved at: ${reviewFilePath}`);
      return reviewFilePath;
    } catch (error) {
      logger.error("PR review process failed:", error);
      throw error;
    } finally {
      try {
        // Passar 'true' para manter os arquivos temporários
        OutputManager.cleanupTempFiles(tempDirPath, true);
      } catch (cleanupError) {
        logger.error("Failed to clean up temporary files:", cleanupError);
      }
    }
  }

  async getRemoteBranches() {
    try {
      const output = await GitOperator.executeGitCommand("git branch -r");
      return output
        .split("\n")
        .map((branch) => branch.trim())
        .filter(Boolean);
    } catch (error) {
      logger.error("Failed to retrieve remote branches:", error);
      return [];
    }
  }
};
