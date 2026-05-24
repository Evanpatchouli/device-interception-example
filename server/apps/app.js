import express from 'express';
import router from '../router/index.js';
import { excatcher, exlogger } from '../midwares/exhandler.js';
import config from "../config.js";

const { monitorPath, PUBLIC, allowedOrigins } = config;
const allowedOriginSet = new Set(allowedOrigins);

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

function isAllowedOrigin(origin) {
  const normalizedOrigin = normalizeOrigin(origin);
  return !normalizedOrigin || allowedOriginSet.has('*') || allowedOriginSet.has(normalizedOrigin);
}

console.log(`Monitor path: ${monitorPath}`, `Public path: ${PUBLIC}`);

const app = express();

app.use(monitorPath, express.static(PUBLIC));

app.use(function (req, res, next) {
  const origin = req.headers.origin;

  if (!isAllowedOrigin(origin)) {
    return res.sendStatus(403);
  }

  if (origin) {
    const normalizedOrigin = normalizeOrigin(origin);
    res.vary("Origin");
    res.header("Access-Control-Allow-Origin", allowedOriginSet.has('*') ? '*' : normalizedOrigin);
  }

  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  return next();
});
app.use('/api', router);
app.use(exlogger);
app.use(excatcher);

export default app;

