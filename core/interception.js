import * as os from "node:os";
import ni from "node-interception";

const { Interception, FilterKeyState, FilterMouseState } = ni;

os.setPriority(os.constants.priority.PRIORITY_HIGH);

export const interception = new Interception();

export function listenKeyboard() {
  interception.setFilter("keyboard", FilterKeyState.ALL);
}

export function listenMouse() {
  interception.setFilter("mouse", FilterMouseState.ALL);
}

export const devices = {
  mices: interception.getMice(),
  keyboards: interception.getKeyboards(),
};

export const mice = devices.mices[1];
export const keyboard = devices.keyboards[1];
