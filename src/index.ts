#! /usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import commander from 'commander';
import { version } from '../package.json';
import { getBranchesFromJson, download } from './util/git';
import { log } from './util/log';
import { options } from './util/options';
import { unzipFile, replaceContent } from './util';

commander
  .version(version)
  .command('create <app-name>')
  .description(`create a new project by cli-ddd@${version}`)
  .action(async (projectName) => {
    log.info(`create a new project by cli-ddd@${version}`);
    // 校验项目名称
    typeof projectName !== 'string' && (log.error('请输入项目名称'), process.exit(1));

    // 校验项目目录
    const dir = path.join(process.cwd(), projectName);
    if (fs.existsSync(dir)) {
      log.error('目录已存在');
      return;
    }
    fs.ensureDirSync(dir);

    const choices = await getBranchesFromJson('https://dengshaomin86.github.io/template');

    // 项目配置
    const { template_url } = await options(choices);
    const choice = choices.find((v) => v.value === template_url);
    const filePath = path.join(dir, `${choice?.name}.zip`);
    const { flag, msg = '' } = await download(template_url, filePath);
    if (!flag) {
      log.error(msg);
      return;
    }

    // 解压文件
    const result = await unzipFile(filePath, dir);
    if (!result) return;

    // 修改项目名称
    log.info('正在处理文件内容');
    replaceContent(dir, [{ source: 'vue3-ts-vite', target: projectName }]);
    log.success('文件内容处理完成');

    log.success('项目创建成功!');
  });

commander.parse(process.argv);
