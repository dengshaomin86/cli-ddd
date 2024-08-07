import chalk, { Color } from 'chalk';

function handle_log(msg: string, type: typeof Color) {
  if (typeof msg !== 'string') msg = JSON.stringify(msg, null, 2);
  console.log(chalk[type](`[${getTime()}]${msg} `));
}

function getTime() {
  const date = new Date();
  let h = date.getHours().toString().padStart(2, '0');
  let m = date.getMinutes().toString().padStart(2, '0');
  let s = date.getSeconds().toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

export const log = {
  info(msg: string) {
    handle_log(msg, 'whiteBright');
  },
  warn(msg: string) {
    handle_log(msg, 'yellowBright');
  },
  success(msg: string) {
    handle_log(msg, 'greenBright');
  },
  error(msg: string) {
    handle_log(msg, 'redBright');
  },
};
