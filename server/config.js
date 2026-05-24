import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { fileURLToPath } from 'url';
import path from "path";
import appConfig from "../app.config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const envPath = path.resolve(projectRoot, '.env');

if (existsSync(envPath)) {
  loadEnvFile(envPath);
}

const ROOT = __dirname;
const PUBLIC = path.join(ROOT, './public');

function parsePort(value, fallback) {
  const port = Number(value);
  return Number.isInteger(port) && port > 0 && port <= 65535 ? port : fallback;
}

function parseAllowedOrigins(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value !== 'string') {
    return [];
  }

  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

const serverConfig = {
  ...appConfig.server,
  protocol: process.env.PROTOCOL || appConfig.server.protocol,
  host: process.env.HOST || appConfig.server.host,
  port: parsePort(process.env.PORT, appConfig.server.port),
  allowedOrigins: parseAllowedOrigins(process.env.ALLOWED_ORIGINS).length > 0
    ? parseAllowedOrigins(process.env.ALLOWED_ORIGINS)
    : appConfig.server.allowedOrigins,
};

function formatOrigin(protocol, host, port) {
  const normalizedHost = host.includes(':') && !host.startsWith('[') ? `[${host}]` : host;
  const portSuffix = port === undefined || port === null || port === "" ? "" : `:${port}`;
  return `${protocol}://${normalizedHost}${portSuffix}`;
}

function getLocalOrigins(serverConfig) {
  const protocol = serverConfig.protocol || 'http';
  const port = serverConfig.port;

  return [
    formatOrigin(protocol, 'localhost', port),
    formatOrigin(protocol, '127.0.0.1', port),
    formatOrigin(protocol, '::1', port),
  ];
}

function normalizeOrigin(origin) {
  if (typeof origin !== 'string') {
    return null;
  }

  const value = origin.trim();
  if (!value) {
    return null;
  }

  if (value === '*') {
    return value;
  }

  try {
    return new URL(value).origin;
  } catch (_) {
    return value.replace(/\/+$/, '');
  }
}

function normalizeAllowedOrigins(serverConfig) {
  const configured = serverConfig.allowedOrigins;
  const source = Array.isArray(configured) ? configured : [configured];
  const origins = source.map(normalizeOrigin).filter(Boolean);

  if (origins.length > 0) {
    return [...new Set(origins)];
  }

  return [...new Set(getLocalOrigins(serverConfig))];
}

const config = {
  ROOT,
  PUBLIC,
  name: serverConfig.name,
  protocol: serverConfig.protocol,
  host: serverConfig.host,
  port: serverConfig.port,
  monitorPath: appConfig.monitor.path,
  allowedOrigins: normalizeAllowedOrigins(serverConfig),
}

export default config;
