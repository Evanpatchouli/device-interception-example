# 项目重构计划

- 日期: 2026-05-23
- 目标: 遵循 `docs/improve.md` 重构项目，运行时基线固定为 Node.js 26.2.0，删除 Bun 运行时相关内容。
- 当前阶段: 等待计划确认，尚未修改业务实现。

## 已确认约束

- 项目规范要求先计划、确认后实施。
- 本轮以 Node.js 26.2.0 为唯一运行时，不保留 Bun 脚本、配置或兼容分支。
- 优先用 Node 原生能力建立测试与配置基线，例如 `node:test`、Node 原生 `.env` 加载能力。
- 修改公共 API 时补 JSDoc，配置和运行方式变更同步更新中英文 README。
- 本次仓库未找到 `.codex/resolutions` 历史方案目录。

## 当前代码事实

- `package.json`、README、PM2 配置和 `scripts/` 仍包含 Bun 入口。
- `core/index.js` 同时承担底层设备、键位映射、输出动作、监听循环和订阅分发。
- `core/events.js` 的销毁路径引用了未导入的 `logger` 与 `interception`。
- `main.js` 在监听回调里硬编码宏 handler 组合。
- Express CORS 与 Socket.IO CORS 当前全开，`server/apps/app.js` 存在重复 `next()`。
- React 监控端在 render/effect 生命周期里注册 socket 监听但未完整解绑。
- `moment` 未见业务使用；`multer` 目前只在未见消费点的 body parser 中定义。
- 当前有 `package-lock.json`，未发现已有测试文件或 CI 配置。

## 实施拆分

### 1. 基线与回归测试

- [x] 调整 `package.json` 的 Node 唯一运行时声明、测试脚本和验证脚本。
- [x] 先为生命周期 bug、键位映射的可分离逻辑补最小 `node:test` 回归测试。
- [ ] 若服务控制面重构落地，为 API 状态读写和配置解析补集成或单元测试。

拟涉及文件:

- `package.json`
- `package-lock.json`
- `test/**/*.test.js` 新增测试文件

### 2. 删除 Bun 与清理依赖表面

- [x] 删除 Bun npm scripts、Bun PM2 文件和 Bun 启动脚本。
- [x] 从 README 中删除 Bun 运行说明与 Bun interpreter 示例。
- [x] 移除确认未使用的依赖与中间件出口，优先处理 `moment` 与 `multer`。
- [x] 去掉 `--no-warnings`，保留 Node 诊断信号。

拟涉及文件:

- `package.json`
- `package-lock.json`
- `pm2/*.bun.json`
- `scripts/start.js`
- `scripts/serve.js`
- `scripts/server.bat`
- `readme.md`
- `readme_cn.md`
- `server/midwares/bodyParser.js` 视依赖清理结果决定是否删除或收缩

### 3. 配置与控制面收口

- [x] 把 host、port、monitor path、允许来源等运行配置收口到 Node 配置入口。
- [x] 保持默认本机运行体验，同时把 CORS 从全开改为配置化白名单。
- [x] 修复 Express 中间件错误流和重复 `next()`。
- [x] 修复 Socket.IO 客户端信息解析与监听解绑风险。

拟涉及文件:

- `app.config.js`
- `server/config.js`
- `server/apps/app.js`
- `server/midwares/exhandler.js`
- `server/model/socketio.js`
- `monitor/src/socket/index.js`
- `.env.example` 可选新增

### 4. 核心输入层与宏层重构

- [x] 先把 `core/index.js` 的设备适配、键位映射、输出动作、监听生命周期拆成职责清楚的模块。
- [x] 让事件销毁路径依赖显式注入或回到生命周期控制器，消除循环式隐式依赖。
- [x] 把宏触发条件与动作执行从 `main.js` 的硬编码并发列表中抽出，形成可测试注册表或 runner。
- [x] 保留现有按键行为语义，避免借重构改变热路径输出时序。

拟涉及文件:

- `core/index.js`
- `core/events.js`
- `core/state.js`
- `core/` 下新增 adapter / mapper / output / listener 文件
- `handlers/index.js`
- `main.js`
- `types.ts`
- `core/types.ts`

### 5. 监控端生命周期修复

- [x] 把 React socket 订阅移入 effect 并成对解绑。
- [x] 保持状态刷新、启停按钮与 toast 行为可用。
- [ ] 视重构范围移除 Vite 示例文案和无关展示资产。

拟涉及文件:

- `monitor/src/App.jsx`
- `monitor/src/components/main.jsx`
- `monitor/src/cache/index.js`
- `monitor/src/api/request.js` 视接口配置调整决定

### 6. 文档、验证与评审

- [x] 更新中英文 README 的 Node 26.2.0、配置、脚本、PM2 和验证说明。
- [x] 执行前端构建、Node 语法检查、BOM 检查和依赖安全摘要检查。
- [x] 在本文件追加评审记录、边界情况与剩余风险。

拟验证命令:

- `npm test`
- `npm run build:web`
- `npm run lint` 若本轮补齐 lint 脚本
- `npm audit` 或等价依赖安全检查

## 需要确认的选项

- [x] 推荐: 本轮先做默认本机安全收口，即配置化 CORS 白名单与更严格的 Socket/API 输入校验。
- [ ] 可选: 同时加入 API 与 Socket.IO token 鉴权。这会修改监控端配置与远程访问方式，需要确认鉴权策略。
- [ ] 可选: 同时补 GitHub Actions 与更完整的覆盖率门槛。若希望先完成代码重构，可放到下一轮。
- [ ] 可选: 本轮是否把 PM2 JSON 一并改成更适合环境变量的 ecosystem 配置文件。

## 实施后评审

- 已将运行时入口收敛到 Node.js 26.2.0，删除 Bun npm scripts、Bun PM2 配置和 Bun 启动脚本。
- 已拆分 `core/index.js`，新增 `core/interception.js`、`core/keymap.js`、`core/output.js`、`core/listener.js`、`core/dispatcher.js`。
- 已将宏行为抽成 `handlers/index.js` 中的声明式 `macros` 和 `createMacroHandler()`，`main.js` 不再手写 6 个 handler 并发列表。
- 已修复 `core/events.js` 销毁路径未定义依赖问题，改为显式 `setDestroyHandler()`。
- 已收紧 Express 与 Socket.IO CORS，默认仅允许本机来源，并支持 `.env` / PM2 env 配置 `ALLOWED_ORIGINS`。
- 已修复 React 端 Socket 监听重复注册，`App` 与 `Main` 都使用 effect cleanup 成对解绑。
- 已移除直接依赖 `moment`、`multer`、`concurrently`，并通过 `npm install --package-lock-only --ignore-scripts` 同步 lockfile。
- 已新增 `.env.example`、`test/core-events.test.js`、`test/keymap.test.js`。
- 已执行 `node --check` 语法检查，已执行 `npm run build:web` 更新 `server/public` 静态产物，已检查触碰文件无 UTF-8 BOM。
- 未执行 `npm test`，遵循用户要求等待人工测试。
- `npm install --package-lock-only --ignore-scripts` 审计摘要仍显示 33 个漏洞，其中 9 个 high；未自动修复，避免引入破坏性依赖升级。
- `npm run build:web` 成功，但 Vite 提示依赖 CSS `@import` 顺序警告与 JS chunk 体积超过 500KB。
- `device-interception-example.zip` 是任务开始前已存在的未跟踪压缩包，未删除或重建；其中可能仍是旧快照。

## 边界情况

- 默认 CORS 只允许当前端口的 `localhost`、`127.0.0.1`、`[::1]`；远程监控需要显式配置 `ALLOWED_ORIGINS`。
- 监控端在 `/monitor/` 下运行时使用同源 API/Socket，Vite 开发环境下仍回退到 `app.config.js` 的服务端地址。
- `rightJumpThrow` 保留原行为：右移按键不等待结束，100ms 后并发执行跳投动作。
- `node-interception` 驱动依旧是外部高风险依赖，本轮未替换底层驱动。
