import cfg from './config.js';
import chalk from 'chalk';
import server from './server.js';
import init from './utils/init.js';

const listen = async (action) => {
  await init();
  const serverUrl = `${cfg.protocol}://${cfg.host}:${cfg.port}`;
  server.listen(cfg.port, cfg.host, () => {
    console.log(chalk.yellow(`------------------ ${cfg.name} ------------------`));
    console.log(`${chalk.green(cfg.name)} is listening at ${chalk.hex("#24a9cd")(serverUrl)}`);
    console.log(chalk.green('Monitor') + ' is deployed at ' + chalk.hex("#24a9cd")(`${serverUrl}${cfg.monitorPath}`));
    action?.();
  })
}

export default {
  listen,
};
