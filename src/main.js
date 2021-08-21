#! /usr/bin/env node

const fs = require('fs');
const path = require('path');
const program = require('commander');
const options = require('./lib/options');
const { log } = require('./util/log');
const { version } = require('../package.json');
const { download_file } = require('./lib/download_file');
// const download_template = require('./lib/download_template');

program
  .version(version)
  .command('create <app-name>')
  .description(`create a new project by cli-ddd@${version}`)
  .action(async (name) => {
    log.info(`create a new project by cli-ddd@${version}`);
    // 校验项目名称
    typeof name !== 'string' && (log.error('请输入项目名称'), process.exit(1));

    // 校验项目目录
    const context = path.resolve(process.cwd(), name);
    if (fs.existsSync(context)) {
      log.error('目录已存在');
      return false;
    }
    fs.mkdirSync(context);

    // 项目配置
    const opts = await options();

    // 下载模板
    await download_file({ context, opts: { ...opts, name } });
  });

program.parse(process.argv);
