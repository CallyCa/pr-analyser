const { execSync } = require("child_process");
const logger = require("./LoggerService");

module.exports = class GitOperator {
  static executeGitCommand(command) {
    try {
      logger.debug(`Executing Git command: ${command}`);
      return execSync(command, { encoding: "utf8", stdio: "pipe" });
    } catch (error) {
      logger.error(`Git command failed: ${error.message}`);
      throw new Error(`Git command failed: ${error.message}`);
    }
  }

  static fetchLatestChanges() {
    logger.info("Fetching latest changes...");
    this.executeGitCommand("git fetch --recurse-submodules");
  }

  static checkoutBranch(branchName) {
    logger.info(`Checking out branch: ${branchName}`);
    this.executeGitCommand(`git checkout ${branchName}`);
    logger.info("Updating submodules...");
    this.executeGitCommand("git submodule update --init --recursive");
  }

  static generateDiff(targetBranch) {
    logger.info(`Generating diff against ${targetBranch}`);
    return this.executeGitCommand(
      `git diff ${targetBranch} --recurse-submodules`
    );
  }
  
  
  
};
