import chalk from "chalk";
import logger from "./logger.js";
import state from "./state.js";
import { interception, listenKeyboard, listenMouse } from "./interception.js";
import { dispatchAll } from "./dispatcher.js";
import { getStrokeKey, KeyBaseName } from "./keymap.js";

/**
 * 创建输入监听循环。
 * @param {'keyboard'|'mouse'|'all'} listened
 * @param {{before?: Function, after?: Function}} handler
 * @param {{setListening: (value: boolean) => void, destroy: () => void}} lifecycle
 * @returns {Promise<void>}
 */
export const createListener = async (listened, handler, lifecycle) => {
  switch (listened) {
    case "keyboard":
      listenKeyboard();
      break;
    case "mouse":
      listenMouse();
      break;
    case "all":
      listenKeyboard();
      listenMouse();
      break;
    default:
      throw new Error(
        `Unset which device to listen: ${chalk.red(listened)}. 
          The ${chalk.yellow("first")} argument of listen() should be ${chalk.yellowBright("'keyboard', 'mouse' or 'all'")}.`,
      );
  }

  lifecycle.setListening(true);

  while (true) {
    const device = await interception.wait();
    const stroke = device?.receive();

    if (!device || !stroke) {
      break;
    }

    const input = getStrokeKey(stroke);
    const baseKey = KeyBaseName(input);

    if (state.listening && handler?.before) {
      await handler.before(stroke, input, baseKey, device);
    }

    device?.send(stroke);

    if (!state.listening) {
      continue;
    }

    dispatchAll();
    handler?.after?.(stroke, input, baseKey, device);
  }

  lifecycle.destroy();
  logger.warn(chalk.yellow("Disconnected"));
};
