import { io } from 'socket.io-client';
import appConfig from '../../../app.config.js';

const isMonitorRuntime = () => {
  const pathname = globalThis.location?.pathname;
  const monitorPath = appConfig.monitor.path.replace(/\/+$/, '');
  return pathname === monitorPath || pathname?.startsWith(`${monitorPath}/`);
};

const getSocketServerPath = () => {
  if (isMonitorRuntime()) {
    return globalThis.location.origin;
  }

  return appConfig.serverPath();
};

export const socket = io(getSocketServerPath(), {
  path: "/socket.io",
  autoConnect: false,
  transports: ['websocket'],
  extraHeaders: {
    'client-info': JSON.stringify(appConfig.client.monitor)
  }
});
