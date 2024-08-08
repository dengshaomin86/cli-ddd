import chalk, { Color } from 'chalk';

function formatdate() {
  const date = new Date();
  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');
  const s = date.getSeconds().toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function formatlog(type: typeof Color, ...args: any[]) {
  console.log(chalk[type](formatdate(), ...args));
}

const logger = {
  info(...args: any[]) {
    formatlog('whiteBright', ...args);
  },
  warn(...args: any[]) {
    formatlog('yellowBright', ...args);
  },
  success(...args: any[]) {
    formatlog('greenBright', ...args);
  },
  error(...args: any[]) {
    formatlog('redBright', ...args);
  },
};

export default logger;
