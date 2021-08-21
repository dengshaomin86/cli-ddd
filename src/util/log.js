const chalk = require('chalk');

function handle_log(msg, type) {
  if (typeof msg !== 'string') msg = JSON.stringify(msg, null, 2);
  console.log(chalk[type](`[${getTime()}]${msg} `));
}

function getTime() {
  const date = new Date();
  const h = date.getHours();
  const m = date.getMinutes();
  const s = date.getSeconds();
  return `${h}:${m}:${s}`;
}

const log = {
  info(msg) {
    handle_log(msg, 'whiteBright');
  },
  warn(msg) {
    handle_log(msg, 'yellowBright');
  },
  success(msg) {
    handle_log(msg, 'greenBright');
  },
  error(msg) {
    handle_log(msg, 'redBright');
  },
};

module.exports = {
  log,
};
