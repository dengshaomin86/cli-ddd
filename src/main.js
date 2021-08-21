#! /usr/bin/env node

const fs = require('fs');
const path = require('path');
const program = require('commander');
const options = require('./util/options');
const { log } = require('./util/log');
const { version } = require('../package.json');
const { templates } = require('./config');
const { download_file } = require('./lib/download_file');
const { download_template } = require('./lib/download_template');

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
    const { template_id } = opts;
    const template = templates.find((item) => item.value === template_id);
    if (!template) return false;
    const { type } = template;

    // 下载模板
    if (type === 'zip') {
      await download_file({ context, opts: { ...opts, name }, template });
    }
    if (type === 'file') {
      download_template({ context, opts: { ...opts, name }, template });
    }
  });

program.parse(process.argv);
