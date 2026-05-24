import logger from "./logger.js";
import { sequentialify, wait } from "./utils.js";
import { keyboard, mice } from "./interception.js";
import { keyKeyNames, keys, mices, mouseClickKeyNames } from "./keymap.js";

/**
 * @type {import("./types").Core.ClickKey}
 */
export const clickKey = async (device, key) => {
  const funcs1 = keys[key].down.map((stroke) => () => {
    device?.send({
      type: "keyboard",
      code: stroke.code,
      state: stroke.state,
      information: 0,
    });
  });
  await sequentialify(...funcs1);

  const funcs2 = keys[key].up.map((stroke) => () => {
    device?.send({
      type: "keyboard",
      code: stroke.code,
      state: stroke.state,
      information: 0,
    });
  });
  await sequentialify(...funcs2);
};

/**
 * @type {import("./types").Core.PressKey}
 */
export const pressKey = async (device, key, duration) => {
  const funcs1 = keys[key].down.map((stroke) => () => {
    device?.send({
      type: "keyboard",
      code: stroke.code,
      state: stroke.state,
      information: 0,
    });
  });
  await sequentialify(...funcs1);
  await wait(duration);

  const funcs2 = keys[key].up.map((stroke) => () => {
    device?.send({
      type: "keyboard",
      code: stroke.code,
      state: stroke.state,
      information: 0,
    });
  });
  await sequentialify(...funcs2);
};

/**
 * @type {import("./types").Core.MiceClick}
 */
export const miceClick = async (device, key) => {
  const strokes = mices[key];
  const funcs = strokes.map((stroke) => () => {
    device?.send(stroke);
  });
  await sequentialify(...funcs);
};

/**
 * @type {import("./types").Core.MicePress}
 */
export const micePress = async (device, key, duration) => {
  const strokes = mices[key];
  const funcs = strokes.map((stroke, i) => async () => {
    if (i > 0) {
      await wait(duration);
    }
    device?.send(stroke);
  });
  await sequentialify(...funcs);
};

const defaultRollingDistance = 120;

/**
 * @type {import("./types").Core.MiceMove}
 */
export const miceMove = (device, delta) => {
  const stroke = { ...mices.MOUSEMOVE[0] };
  stroke.x = delta.x || 0;
  stroke.y = delta.y || 0;
  device?.send(stroke);
};

/**
 * @type {import("./types").Core.MiceRoll}
 */
export const miceRoll = (device, rolling) => {
  const stroke = { ...mices.MWHEELUP[0] };
  stroke.rolling = rolling ?? 0;
  device?.send(stroke);
};

/**
 * @type {import("./types").Core.MiceWheelDown}
 */
export const miceWheelDown = (device, rolling) => {
  miceRoll(device, -Math.abs(rolling ?? defaultRollingDistance));
};

/**
 * @type {import("./types").Core.MiceWheelUp}
 */
export const miceWheelUp = (device, rolling) => {
  miceRoll(device, Math.abs(rolling ?? defaultRollingDistance));
};

/**
 * @type {import("./types").Core.DownKey}
 */
export const downKey = async (device, key) => {
  const funcs = keys[key].down.map((stroke) => () => {
    device?.send({
      type: "keyboard",
      code: stroke.code,
      state: stroke.state,
      information: 0,
    });
  });
  await sequentialify(...funcs);
};

/**
 * @type {import("./types").Core.UpKey}
 */
export const upKey = async (device, key) => {
  const funcs = keys[key].up.map((stroke) => () => {
    device?.send({
      type: "keyboard",
      code: stroke.code,
      state: stroke.state,
      information: 0,
    });
  });
  await sequentialify(...funcs);
};

/**
 * @type {import("./types").Core.UseKey}
 */
export const useKey = async (
  key,
  {
    pressDuration: dr = undefined,
    mode = undefined,
    device = undefined,
    rolling,
    x,
    y,
  } = {
    pressDuration: undefined,
    mode: undefined,
    device: undefined,
  },
) => {
  if (keyKeyNames.has(key)) {
    switch (mode) {
      case "down":
        await downKey(device || keyboard, key);
        break;
      case "up":
        await upKey(device || keyboard, key);
        break;
      default:
        await (dr ? pressKey(device || keyboard, key, dr) : clickKey(device || keyboard, key));
        break;
    }
    return;
  }

  if (mouseClickKeyNames.has(key)) {
    await (dr ? micePress(device || mice, key, dr) : miceClick(device || mice, key));
    return;
  }

  switch (key) {
    case "MOUSEMOVE":
      miceMove(device || mice, { x, y });
      return;
    case "MWHEELDOWN":
      miceWheelDown(device || mice, rolling);
      return;
    case "MWHEELUP":
      miceWheelUp(device || mice, rolling);
      return;
    default:
      logger.error(`Unsupported key: ${key}`);
  }
};
