import { exec } from "child_process";
exec("set NODE_ENV=production && node --env-file-if-exists=.env index.js", { windowsHide: true });
