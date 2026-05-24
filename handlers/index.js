import * as core from "../core/index.js";
import { concurrentify, wait as waitMs } from "../core/utils.js";
import cs2config from "../configs/cs2.config.js";
import state from "../state.js";

const { KeyUpName, useKey } = core;
const { keyBinding: cs2 } = cs2config;

const pressDefault = () => state.pressDuration;

/**
 * @typedef {Object} KeyStep
 * @property {'key'} kind
 * @property {keyof typeof cs2} binding
 * @property {number | (() => number)=} pressDuration
 * @property {'down' | 'up' | 'clickOrPress'=} mode
 * @property {boolean=} await
 *
 * @typedef {Object} WaitStep
 * @property {'wait'} kind
 * @property {number} ms
 *
 * @typedef {Object} ParallelStep
 * @property {'parallel'} kind
 * @property {MacroStep[]} steps
 *
 * @typedef {KeyStep | WaitStep | ParallelStep} MacroStep
 * @typedef {{id: string, trigger: string, description: string, steps: MacroStep[]}} MacroDefinition
 */

/**
 * 声明式宏注册表，描述触发键和动作步骤，避免入口层硬编码宏链。
 * @type {MacroDefinition[]}
 */
export const macros = [
  {
    id: "jumpThrow",
    trigger: "F7",
    description: "跳投",
    steps: [
      {
        kind: "parallel",
        steps: [
          { kind: "key", binding: "attack1", pressDuration: pressDefault },
          { kind: "key", binding: "jump" },
        ],
      },
    ],
  },
  {
    id: "jumpThrow2",
    trigger: "F8",
    description: "右键跳投",
    steps: [
      {
        kind: "parallel",
        steps: [
          { kind: "key", binding: "attack2", pressDuration: pressDefault },
          { kind: "key", binding: "jump" },
        ],
      },
    ],
  },
  {
    id: "forwardJumpThrow",
    trigger: "F9",
    description: "前跳投",
    steps: [
      {
        kind: "parallel",
        steps: [
          { kind: "key", binding: "forward", pressDuration: pressDefault, mode: "clickOrPress" },
          { kind: "key", binding: "attack1", pressDuration: pressDefault },
          { kind: "key", binding: "jump" },
        ],
      },
    ],
  },
  {
    id: "jumpDoubleThrow",
    trigger: "F10",
    description: "双键跳投",
    steps: [
      {
        kind: "parallel",
        steps: [
          { kind: "key", binding: "attack1", pressDuration: pressDefault },
          { kind: "key", binding: "attack2", pressDuration: pressDefault },
          { kind: "key", binding: "jump" },
        ],
      },
    ],
  },
  {
    id: "forwardJumpDoubleThrow",
    trigger: "F11",
    description: "前双键跳投",
    steps: [
      {
        kind: "parallel",
        steps: [
          { kind: "key", binding: "forward", pressDuration: pressDefault, mode: "clickOrPress" },
          { kind: "key", binding: "attack1", pressDuration: pressDefault },
          { kind: "key", binding: "attack2", pressDuration: pressDefault },
          { kind: "key", binding: "jump" },
        ],
      },
    ],
  },
  {
    id: "rightJumpThrow",
    trigger: "F12",
    description: "Mirage VIP 慢烟",
    steps: [
      { kind: "key", binding: "right", pressDuration: 400, mode: "clickOrPress", await: false },
      { kind: "wait", ms: 100 },
      {
        kind: "parallel",
        steps: [
          { kind: "key", binding: "attack1", pressDuration: pressDefault },
          { kind: "key", binding: "jump" },
        ],
      },
    ],
  },
];

const macroMap = new Map(macros.map((macro) => [macro.id, macro]));

const resolve = (value) => (typeof value === "function" ? value() : value);

/**
 * 执行单个宏步骤。
 * @param {MacroStep} step
 * @param {{useKey?: typeof useKey, wait?: (ms: number) => Promise<void>}} context
 * @returns {Promise<void>}
 */
export const runMacroStep = async (step, context = {}) => {
  const runKey = context.useKey || useKey;
  const wait = context.wait || waitMs;

  switch (step.kind) {
    case "key": {
      const promise = runKey(cs2[step.binding], {
        pressDuration: resolve(step.pressDuration),
        mode: step.mode,
      });
      if (step.await === false) {
        return;
      }
      await promise;
      return;
    }
    case "wait":
      await wait(step.ms);
      return;
    case "parallel":
      await concurrentify(...step.steps.map((child) => () => runMacroStep(child, context)));
      return;
    default:
      throw new Error(`Unsupported macro step kind: ${step.kind}`);
  }
};

/**
 * 执行宏定义。
 * @param {MacroDefinition} macro
 * @param {{useKey?: typeof useKey, wait?: (ms: number) => Promise<void>}} context
 * @returns {Promise<void>}
 */
export const runMacro = async (macro, context = {}) => {
  for (const step of macro.steps) {
    await runMacroStep(step, context);
  }
};

/**
 * 创建统一宏调度器。
 * @param {MacroDefinition[]} registry
 * @param {{useKey?: typeof useKey, wait?: (ms: number) => Promise<void>}} context
 * @returns {(stroke: import("node-interception").Stroke, input: string | null | undefined) => Promise<void>}
 */
export const createMacroHandler = (registry = macros, context = {}) => {
  return async (stroke, input) => {
    if (stroke?.type !== "keyboard") {
      return;
    }

    await concurrentify(
      ...registry
        .filter((macro) => input === KeyUpName(macro.trigger))
        .map((macro) => () => runMacro(macro, context)),
    );
  };
};

const createLegacyHandler = (id) => {
  return (stroke, input, key) => {
    return () => {
      const macro = macroMap.get(id);
      const trigger = key || macro.trigger;
      return createMacroHandler([{ ...macro, trigger }])(stroke, input);
    };
  };
};

/**
 * @type {import("../types.js").App.JumpThrowHandler}
 */
export const jumpThrow = createLegacyHandler("jumpThrow");

/**
 * @type {import("../types.js").App.JumpThrowHandler}
 */
export const jumpThrow2 = createLegacyHandler("jumpThrow2");

/**
 * @type {import("../types.js").App.ForwardJumpThrowHandler}
 */
export const forwardJumpThrow = createLegacyHandler("forwardJumpThrow");

/**
 * @type {import("../types.js").App.JumpThrowHandler}
 */
export const jumpDoubleThrow = createLegacyHandler("jumpDoubleThrow");

/**
 * @type {import("../types.js").App.JumpThrowHandler}
 */
export const forwardJumpDoubleThrow = createLegacyHandler("forwardJumpDoubleThrow");

/**
 * @type {import("../types.js").App.JumpThrowHandler}
 */
export const rightJumpThrow = createLegacyHandler("rightJumpThrow");
