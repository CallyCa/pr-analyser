#!/usr/bin/env node
const { Command } = require("commander");
const inquirer = require("inquirer");
const { execSync } = require("child_process");
const fs = require("fs");
const logger = require("../src/services/LoggerService");
const PRMain = require("../src/commands/PRMain");
const program = new Command();
const version = require("../package.json").version;

function getGitBranches() {
  try {
    const branches = execSync("git branch --remotes --format='%(refname:short)'", {
      encoding: "utf-8",
    });
    return branches.split("\n").filter((branch) => branch.trim() !== "" && !branch.includes("detached"));
  } catch (error) {
    logger.error("Failed to retrieve Git branches:", error);
    return ["main", "develop"];
  }
}

function validateOutputDirectory(outputPath) {
  if (outputPath && !fs.existsSync(outputPath)) {
    throw new Error(
      `The output directory "${outputPath}" does not exist. Please provide a valid path.`,
    );
  }
}

async function promptUserForOptions() {
  const branchChoices = getGitBranches();

  const answers = await inquirer.prompt([
    {
      type: "list",
      name: "branch",
      message: "Select a branch to review:",
      choices: branchChoices,
    },
    {
      type: "list",
      name: "mode",
      message: "Select review mode:",
      choices: ["review", "description"],
    },
    {
      type: "input",
      name: "targetBranch",
      message:
        "Enter the target branch to compare against (default: development):",
      default: "development",
    },
    {
      type: "input",
      name: "output",
      message: "Enter the output folder (leave empty for default):",
      default: "",
    },
    {
      type: "confirm",
      name: "verbose",
      message: "Enable verbose logging?",
      default: false,
    },
  ]);

  // Valida o diretório de saída fornecido
  validateOutputDirectory(answers.output);

  return answers;
}

program
  .name("pr-reviewer")
  .description("CLI tool for automated PR reviews using LLM")
  .version(version)
  .option("-i, --interactive", "enable interactive mode");

program.parse();

(async () => {
  const options = program.opts();

  if (options.interactive) {
    // Importa ora dinamicamente
    const ora = (await import("ora")).default;

    const answers = await promptUserForOptions();
    const reviewer = new PRMain(answers);
    const spinner = ora("Starting PR review...").start();

    try {
      if (answers.verbose) {
        logger.enableVerbose();
      }

      await reviewer.run();
      spinner.succeed("PR review completed!");
      process.exit(0);
    } catch (error) {
      spinner.fail("PR review failed.");
      logger.error("Fatal error:", error);
      process.exit(1);
    }
  } else {
    program.parse(process.argv);
  }
})();
