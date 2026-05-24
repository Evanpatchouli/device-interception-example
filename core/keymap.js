import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

export const keys = require("./key_codes.json");
export const mices = require("./mouse_codes.json");

export const keyKeyNames = new Set(Object.keys(keys));

const clickMiceActions = ["MOUSE1", "MOUSE2", "MOUSE3", "MOUSE4", "MOUSE5", "MOUSE6"];

export const mouseClickKeyNames = new Set(clickMiceActions);
export const keyCodeToKeyNameMap = new Map();

Object.keys(keys).forEach((keyName) => {
  keys[keyName].down.forEach((down) => {
    keyCodeToKeyNameMap.set(`${keyName}_down`, `${down.code}-${down.state}`);
    keyCodeToKeyNameMap.set(`${down.code}-${down.state}`, `${keyName}_down`);
  });
  keys[keyName].up.forEach((up) => {
    keyCodeToKeyNameMap.set(`${keyName}_up`, `${up.code}-${up.state}`);
    keyCodeToKeyNameMap.set(`${up.code}-${up.state}`, `${keyName}_up`);
  });
});

/**
 * 获取按下的键名。
 * @param {import("node-interception").MouseStroke | import("node-interception").KeyStroke} stroke
 * @returns {string|null|undefined}
 */
export const getStrokeKey = (stroke) => {
  if (stroke?.type === "keyboard") {
    return keyCodeToKeyNameMap.get(`${stroke.code}-${stroke.state}`);
  }

  switch (stroke?.state) {
    case 0:
      return "MOUSEMOVE";
    case 1:
      return "MOUSE1_down";
    case 2:
      return "MOUSE1_up";
    case 4:
      return "MOUSE2_down";
    case 8:
      return "MOUSE2_up";
    case 16:
      return "MOUSE3_down";
    case 32:
      return "MOUSE3_up";
    case 64:
      return "MOUSE4_down";
    case 128:
      return "MOUSE4_up";
    case 256:
      return "MOUSE5_down";
    case 512:
      return "MOUSE5_up";
    case 1024:
      return stroke.rolling > 0 ? "MWHEEL_UP" : "MWHEEL_DOWN";
    default:
      return null;
  }
};

/** 将 KeyBase 转为 KeyDown。 */
export const KeyDownName = (key) => `${key}_down`;

/** 将 KeyBase 转为 KeyUp。 */
export const KeyUpName = (key) => `${key}_up`;

/** 从 StrokeKey 提取 KeyBase。 */
export const KeyBaseName = (key) => {
  if (key) {
    return key.replace(/_(down|up)$/, "");
  }
  return null;
};
