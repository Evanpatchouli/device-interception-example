import EventEmitter from 'node:events';
import state from './state.js';
import logger from './logger.js';

const emitter = new EventEmitter();

const events = new Map();
let destroyHandler = null;

emitter.on('stop', () => {
  state.SET_LISTENING(false);
  events.get('stop')?.();
});

emitter.on('start', () => {
  state.SET_LISTENING(true);
  events.get('start')?.();
});


emitter.on('destroy', () => {
  emitter.emit('stop');
  logger.info("Received destroy signal, destroy instance...");
  events.get('destroy')?.();
  destroyHandler?.();
});

export function setDestroyHandler(cb) {
  destroyHandler = cb;
}

export function onDestroy(cb) {
  if (typeof cb === 'function') {
    events.set('destroy', cb);
    return;
  }
  emitter.emit('destroy');
}

export const onListen = (cb) => {
  events.set('start', cb);
}

export const offListen = (cb) => {
  events.set('stop', cb);
}

export default emitter;
