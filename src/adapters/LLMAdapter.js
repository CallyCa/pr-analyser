const fs = require("fs").promises;
const OpenAI = require("openai");
const logger = require("../services/LoggerService");
const { PROMPTS } = require("../../config/prompts.config");
const path = require("path");

module.exports = class LLMAdapter {
  constructor(apiKey = process.env.OPEN_API_KEY) {
    if (!apiKey) {
      throw new Error("API key is required");
    }
    this.client = new OpenAI({ apiKey });
  }

  async ensureDirectoryExists(directory) {
    try {
      await fs.mkdir(directory, { recursive: true });
    } catch (error) {
      logger.error(`Error creating directory ${directory}: ${error.message}`);
      throw error;
    }
  }

  async processChanges(changesFilePath, mode = "review", outputFolder) {
    try {
      logger.info(`Processing changes in mode: ${mode}`);
      const changes = await fs.readFile(changesFilePath, "utf-8");

      if (!PROMPTS[mode]) {
        throw new Error(`Invalid mode: ${mode}`);
      }

      const response = await this.client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: PROMPTS[mode] },
          { role: "user", content: changes },
        ],
      });

      const result = response.choices[0].message.content;
      const outputPath = path.join(outputFolder, `output_${mode}.txt`);

      // Verifica se o diretório de saída existe
      await this.ensureDirectoryExists(outputFolder);

      await fs.writeFile(outputPath, result, "utf-8");
      logger.info(`LLM response saved to ${outputPath}`);
      return outputPath;
    } catch (error) {
      logger.error(`Error processing LLM response: ${error.message}`);
      throw error;
    }
  }
};
