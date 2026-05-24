import Resp from '../model/resp.js';
import logger from '../utils/logger.js';

const exhandleStrategy = new Map();

exhandleStrategy.set(400, (res, ...args) => {
  const [msg, symbol, data, status] = args;
  if (status) {
    res.status(status).json(Resp.fail(msg, symbol ?? -1, data ?? null));
  } else {
    res.json(Resp.fail(msg, symbol ?? -1, data ?? null));
  }
});

exhandleStrategy.set(500, (res, ...args) => {
  const [msg, symbol, data, status] = args;
  if (status) {
    res.status(status).json(Resp.bad(msg));
  } else {
    res.json(Resp.bad(msg));
  }
})

export function excatcher(err, req, res, next) {
  if (!err) {
    return next();
  }

  if (res.headersSent) {
    return next(err);
  }

  try {
    const payload = JSON.parse(err.message);
    const { code, msg, symbol, data, back, status } = payload;
    if (back !== false) {
      const handler = exhandleStrategy.get(code);
      if (handler) {
        return handler(res, msg, symbol, data, status);
      }
      return res.json(Resp.bad("System Exception"));
    }
    return res.json(Resp.bad("System Exception"));
  } catch (_) { // cannot be parsed to JSON object => common error
    return res.json(Resp.bad("System Exception"));
  }
}
export function exlogger(err, req, res, next) {
  if (!err) {
    return next();
  }

  if (logger.levelIndex() <= 4) {
    logger.error(err);
  } else {
    logger.error(err.message ?? err);
  }

  return next(err);
}
