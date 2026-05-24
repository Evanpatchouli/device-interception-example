import state from "./state.js";

/** @type {Map<string, Function>} */
const handlers = new Map();

export const dispatch = (keys) => {
  const key = JSON.stringify([...keys].sort());
  if (handlers.has(key)) {
    handlers.get(key)?.();
  }
};

export const dispatchAll = () => {
  handlers.forEach((handler, keyString) => {
    const keys = JSON.parse(keyString);
    state.areKeysActive?.(keys) && handler();
  });
};

/**
 * @type {import("./types").Core['subscribe']}
 */
export const subscribe = (keys, handler) => {
  const sortedKeys = [...keys].sort();
  const keyString = JSON.stringify(sortedKeys);
  handlers.set(keyString, handler);
};
