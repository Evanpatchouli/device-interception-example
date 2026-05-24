import test from "node:test";
import assert from "node:assert/strict";
import { onDestroy, setDestroyHandler } from "../core/events.js";

test("onDestroy emits registered cleanup and destroy handler", () => {
  let eventCalled = false;
  let handlerCalled = false;

  onDestroy(() => {
    eventCalled = true;
  });
  setDestroyHandler(() => {
    handlerCalled = true;
  });

  onDestroy();

  assert.equal(eventCalled, true);
  assert.equal(handlerCalled, true);
});
