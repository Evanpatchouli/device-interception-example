# cs2-jumpthrow-ez

<p align="left">
  <a href="#"><img alt="github" src="https://img.shields.io/badge/Github-grey.svg"></a>
  <a href="#"><img alt="License" src="https://img.shields.io/badge/license-LGPL3-green.svg"></a>
  <a href="#"><img alt="platform" src="https://img.shields.io/badge/os-windows_11-blue.svg"></a>
  <a href="#"><img alt="NodeJS" src="https://img.shields.io/badge/NodeJS-26.2.0-green.svg"></a>
  <a href="#"><img alt="CS:GO" src="https://img.shields.io/badge/CS:GO-black.svg"></a>
</p>

An example Node.js application to easily jump-throw on **windows** in CS2.

This project targets Node.js 26.2.0.

## Disclaimer

<font color="red">Warn! This project is for learning and communication purposes only, and if it is used in the game, you may be banned by VAC! We are not responsible if you are banned for this</font>

### Installing the driver

Using a command prompt with **Administrative Privileges**:

```cmd
npm run install:driver
```

> You can uninstall it later using `npm run uninstall:driver` instead.

You'll need to **restart** for the driver installation to be complete.

## Example Usage

In example codes below, some throw-actions in _Counter-Strike 2_ are applied, `F7` is set to trigger the jump-throw action.

Run the Node script with `npm run start` or `npm run start:node` to execute `index.js`. If you need to start the server entry, use `npm run serve`, `npm run serve:node`, or `node-serve.bat`.

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

## Runtime configuration

The server reads `.env` with Node.js 26.2.0 native dotenv support. Copy `.env.example` if you need to override local defaults:

```env
HOST=127.0.0.1
PORT=30016
PROTOCOL=http
ALLOWED_ORIGINS=
```

`ALLOWED_ORIGINS` is a comma-separated list. Leave it empty to allow only `localhost`, `127.0.0.1`, and `[::1]` on the configured port.

## Run with PM2

You can use `pm2` to keep running the script in the background.

The `pm2` directory contains two Node-only PM2 configuration files:

- `pm2/start.json`: runs `index.js`
- `pm2/serve.json`: runs `serve.js`

Before using them, you need to install `pm2` globally:

```shell
npm install -g pm2
```

Then modify these files to fit your environment. Mainly, you need to update these parameters:

- `cwd`: the root directory to execute the script
- `out_file`: the path of the output file, could be absolute or relative (cwd)
- `error_file`: the path of the error file, could be absolute or relative (cwd)
- `env`: host, port, protocol, and allowed origins

PM2 runs these configurations with Node. If your PM2 environment does not use Node.js 26.2.0, point your environment or PM2 interpreter to the Node 26.2.0 executable.

Then you can run the script with pm2 just like:

```shell
# my project path is at D:\Work\device-interception-example
pm2 start ./pm2/start.json
pm2 start ./pm2/serve.json
```

By this way, the server is running in the background, and i can use web monitor to manage it.

## Exception

If you encounter the following error:

- script is running, but hack is not working, maybe the device used is not the one actually used in the game.
  - You can check the device by `console.log(device)` in the handler to know which device in devices is used.
- script is running as well as hack, but the output action is not as expected, maybe the key-binding at your machine is different from the example codes.
  - You can run the `check.js` to check the key-binding, and update the `key_codes` and `mouse_codes` in `core` yourself.
- script is terminated, maybe it is killed by the anti-hack system of the game.
  - For this case, you'd better not to run this script in the game. Because it may cause you to be banned by the game.

## Credits

- [Oblitum] for creating the original interception library.
- [Rami Sabbagh] for the wrapper library `node-interception`.
- [Evanpatchouli] for creating this project.

[GitHub]: https://github.com/Evanpatchouli/device-interception-example
[Driver]: https://github.com/oblitum/Interception
[Oblitum]: https://github.com/oblitum
[node-interception]: https://github.com/Rami-Sabbagh/node-interception
[Rami Sabbagh]: https://github.com/Rami-Sabbagh
[Evanpatchouli]: https://github.com/Evanpatchouli
