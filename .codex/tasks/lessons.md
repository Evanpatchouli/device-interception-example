# 重构教训

- Node.js 26.2.0 下不要继续使用旧 JSON import assertion 写法；运行时脚本需要改为 `createRequire()` 或当前 import attributes 语法。
- 监控端如果会被服务端静态托管，API 与 Socket 地址应优先同源，避免端口从 `.env` 改动后仍被前端静态配置锁死。
- 删除运行时支持不能只改 README；需要同时扫 npm scripts、PM2、批处理、辅助脚本和构建产物。
