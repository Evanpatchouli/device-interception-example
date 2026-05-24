import { Server } from 'socket.io';
import server from '../server.js';
import logger from '../utils/logger.js';
import * as core from '../../core/index.js';
import state from '../state/index.js';
import config from '../config.js';
const { info, warn } = logger;
const allowedOriginSet = new Set(config.allowedOrigins);

function normalizeOrigin(origin) {
  if (typeof origin !== 'string') {
    return null;
  }

  try {
    return new URL(origin).origin;
  } catch (_) {
    return origin.replace(/\/+$/, '');
  }
}

function createSocketCorsOrigin() {
  if (allowedOriginSet.has('*')) {
    return '*';
  }

  return (origin, callback) => {
    const normalizedOrigin = normalizeOrigin(origin);
    if (!normalizedOrigin || allowedOriginSet.has(normalizedOrigin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Origin is not allowed by Socket.IO CORS'));
  };
}

function parseClientInfo(clientInfoHeader) {
  const clientInfoStr = Array.isArray(clientInfoHeader) ? clientInfoHeader[0] : clientInfoHeader;
  if (!clientInfoStr) {
    return {};
  }

  try {
    const clientInfo = JSON.parse(clientInfoStr);
    if (clientInfo && typeof clientInfo === 'object' && !Array.isArray(clientInfo)) {
      return clientInfo;
    }
  } catch (error) {
    warn(`Invalid client-info header ignored: ${error.message}`);
  }

  return {};
}

class SocketIoProxy {
  /**
   * @type {SocketIoProxy|null}
   */
  _instance = null;
  /**
   * @type {Server}
   */
  server = null;
  static _instance = null;
  constructor() {
    this.server = new Server(server, {
      path: "/socket.io/",
      cors: {
        origin: createSocketCorsOrigin(),
        methods: ["GET", "POST"],
        allowedHeaders: ["client-info", "content-type"]
      }
    });
    state.socket = this.server;
    info('SocketIo server created!');
    this.server.on('connection', (socket) => {
      const clientInfo = parseClientInfo(socket.handshake.headers['client-info']);
      state.clients.set(socket.id, clientInfo);
      const clientName = typeof clientInfo.name === 'string' && clientInfo.name ? clientInfo.name : 'Unknown';
      info(`Client (${clientName}) connected.`);
      socket.on('message', (data) => {
        socket.emit('message', data);
      });
      socket.on('status', (data) => {
        socket.emit('status', core.isListening());
      })
      socket.on('disconnect', () => {
        info(`Client (${clientName}) disconnected.`);
      });
    });
    this.server.on('close', () => {
      info('SocketIO server closed');
    });
  }

  static instance() {
    if (!this._instance) {
      this._instance = new SocketIoProxy();
    }
    return this._instance;
  }
}

export async function init() {
  return SocketIoProxy.instance();
}

export const instance = SocketIoProxy.instance();

export default {
  init,
  instance
}
