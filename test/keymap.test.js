import test from "node:test";
import assert from "node:assert/strict";
import { getStrokeKey, KeyBaseName, KeyDownName, KeyUpName } from "../core/keymap.js";

test("key name helpers add and strip key states", () => {
  assert.equal(KeyDownName("F7"), "F7_down");
  assert.equal(KeyUpName("F7"), "F7_up");
  assert.equal(KeyBaseName("F7_up"), "F7");
  assert.equal(KeyBaseName(null), null);
});

test("getStrokeKey maps known mouse strokes", () => {
  assert.equal(getStrokeKey({ type: "mouse", state: 1 }), "MOUSE1_down");
  assert.equal(getStrokeKey({ type: "mouse", state: 2 }), "MOUSE1_up");
  assert.equal(getStrokeKey({ type: "mouse", state: 1024, rolling: 120 }), "MWHEEL_UP");
  assert.equal(getStrokeKey({ type: "mouse", state: 1024, rolling: -120 }), "MWHEEL_DOWN");
});
