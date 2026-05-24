# CS2 轻松跳投

<p align="left">
  <a href="#"><img alt="github" src="https://img.shields.io/badge/Github-grey.svg"></a>
  <a href="#"><img alt="License" src="https://img.shields.io/badge/license-LGPL3-green.svg"></a>
  <a href="#"><img alt="platform" src="https://img.shields.io/badge/os-windows_11-blue.svg"></a>
  <a href="#"><img alt="NodeJS" src="https://img.shields.io/badge/NodeJS-26.2.0-green.svg"></a>
  <a href="#"><img alt="CS:GO" src="https://img.shields.io/badge/CS:GO-black.svg"></a>
</p>

一个 **windows** 上的 Node.js 示例程序，用于在 CS2 中轻松实现跳投。

本项目面向 Node.js 26.2.0 运行。

## 免责申明

<font color="red">警告！本项目仅用于学习和交流，请勿在游戏中使用，您有可能被 VAC 封禁！如果您为此遭到封禁，我方概不负责!</font>

### 安装驱动

在具有**管理员权限**的命令行执行:

```cmd
npm run install:driver
```

> 之后你可以使用`npm run uninstall:driver` 来卸载驱动.

在驱动安装完成后你需要**重启**计算机。

## 示例用法

在下面的示例代码中，应用了 CS2 中的一些投掷操作，`F7` 被设置为触发跳投动作。

使用 Node 入口运行脚本：`npm run start` 或 `npm run start:node` 执行 `index.js`。如果需要启动服务入口，使用 `npm run serve`、`npm run serve:node` 或 `node-serve.bat`。

```javascript
function main() {
  logger.info("Press any key or move the mouse to generate strokes.");
  logger.info(`Press ${chalk.blueBright("ESC")} to exit and restore back control.`);
  macros.forEach((macro) => {
    logger.info(`【${macro.trigger}】${macro.description}`);
  });

  const runMacros = createMacroHandler();
  core
    .listen("all", {
      after: async (stroke, input) => {
        await runMacros(stroke, input);
      },
    })
    .catch((error) => logger.error(error));
}
```

## 运行配置

服务端使用 Node.js 26.2.0 原生 dotenv 能力读取 `.env`。如需覆盖本机默认值，可以复制 `.env.example`：

```env
HOST=127.0.0.1
PORT=30016
PROTOCOL=http
ALLOWED_ORIGINS=
```

`ALLOWED_ORIGINS` 使用逗号分隔。留空时只允许配置端口上的 `localhost`、`127.0.0.1` 和 `[::1]`。

## 使用 PM2 运行

你可以使用 `pm2` 来在后台持续运行脚本。

`pm2` 目录中提供了两个 Node 专用 PM2 配置文件：

- `pm2/start.json`: 运行 `index.js`
- `pm2/serve.json`: 运行 `serve.js`

在使用之前，你需要全局安装 `pm2`:

```shell
npm install -g pm2
```

然后修改这些文件以适应你的环境。主要是更新以下参数:

- `cwd`: 执行脚本的根目录
- `out_file`: 输出文件的路径，可以是绝对路径或相对路径 (cwd)
- `error_file`: 错误文件的路径，可以是绝对路径或相对路径 (cwd)
- `env`: 主机、端口、协议和允许来源

PM2 会用 Node 运行这些配置。如果你的 PM2 环境没有使用 Node.js 26.2.0，请将运行环境或 PM2 解释器指向 Node 26.2.0 可执行文件。

然后你可以像这样使用 pm2 运行脚本:

```shell
# my project path is at D:\Work\device-interception-example
pm2 start ./pm2/start.json
pm2 start ./pm2/serve.json
```

通过这种方式，服务器在后台运行，我可以使用 web 控制台来管理它。

## 异常

如果你遇到以下异常：

- 脚本正在运行，但辅助没有生效，可能使用的设备不是实际游戏中使用的设备。
  - 你可以在处理程序中使用 `console.log(device)` 来查看是否是 devices 中使用的设备。
- 脚本正在运行，辅助也生效了，但输出的动作不如预期，可能你的机器上的按键绑定与示例代码不同。
  - 你可以运行 `check.js` 来查看按键绑定，然后手动更新 `core` 中的 `key_codes` 和 `mouse_codes`。
- 脚本被终止，可能是被游戏的反作弊系统杀死了。
  - 对于这种情况，最好不要试图再在游戏中运行此程序。因为这可能导致你被游戏封号。

## 致谢

- [Oblitum] 创建了原始的 interception 库。
- [Rami Sabbagh] 提供了 `node-interception` 包装库。
- [Evanpatchouli] 创建了这个项目。

[GitHub]: https://github.com/Evanpatchouli/device-interception-example
[Driver]: https://github.com/oblitum/Interception
[Oblitum]: https://github.com/oblitum
[node-interception]: https://github.com/Rami-Sabbagh/node-interception
[Rami Sabbagh]: https://github.com/Rami-Sabbagh
[Evanpatchouli]: https://github.com/Evanpatchouli
