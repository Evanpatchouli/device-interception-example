import chalk from "chalk";
import * as core from "./core/index.js";
import logger from "./core/logger.js";
import { createMacroHandler, macros } from "./handlers/index.js";

/**
 * 
 * @param {{onListen: VoidFunction; offListen: VoidFunction; socket: import('socket.io').Socket}} options 
 */
function main(options) {
  logger.info("Press any key or move the mouse to generate strokes.");
  logger.info(`Press ${chalk.blueBright("ESC")} to exit and restore back control.`);
  macros.forEach((macro) => {
    logger.info(`【${macro.trigger}】${macro.description}`);
  });

  core.onListen(options?.onListen);
  core.offListen(options?.offListen);
  const runMacros = createMacroHandler();

  core.listen('all', {
    before: () => { },
    after: async (stroke, input, baseKey, device) => {
      await runMacros(stroke, input, baseKey, device);
    },
  }).catch((error) => logger.error(error));
}

process.on('SIGINT', () => {
  console.log('Received SIGINT. Exiting...');
  process.exit(0);
});

// 捕获 SIGTERM 信号 (例如 kill 命令)
process.on('SIGTERM', () => {
  console.log('Received SIGTERM. Exiting...');
  process.exit(0);
});

// Start listening for keyboard and mouse strokes.w
export default main;
