import emitter, { onListen, offListen, onDestroy, setDestroyHandler } from "./events.js";
import state from "./state.js";
import { interception, listenKeyboard, listenMouse } from "./interception.js";
import { createListener } from "./listener.js";

setDestroyHandler(() => interception?.destroy());

/**
 * @type {import("./types").Core['start']}
 */
const start = () => {
  emitter.emit("start");
};

/**
 * @type {import("./types").Core['stop']}
 */
const stop = () => {
  emitter.emit("stop");
};

/**
 * @type {import("./types").Core['destroy']}
 */
const destroy = () => {
  emitter.emit("destroy");
};

/**
 * @type {import("./types").Core['isListenning']}
 */
const isListening = () => {
  return state.listening;
};

/**
 * @param {boolean} value
 */
const setListening = (value) => {
  if (value) {
    start();
  } else {
    stop();
  }
};

/**
 * @type {import("./types").Core['listen']}
 */
const listen = (listened, handler) => {
  return createListener(listened, handler, { setListening, destroy });
};

export {
  interception,
  isListening,
  setListening,
  onListen,
  offListen,
  onDestroy,
  start,
  stop,
  destroy,
  listenKeyboard,
  listenMouse,
  listen,
};

export * from "./interception.js";
export * from "./keymap.js";
export * from "./output.js";
export * from "./dispatcher.js";

export const emit = (event) => {
  emitter.emit(event);
};
