#! /usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import commander from 'commander';
import inquirer from 'inquirer';
import logger from './libs/logger';
import { version } from '../package.json';
import { unzipFile, replaceContent } from './utils';
import { getBranchesFromJson, download } from './utils/git';

const TEMPLATE_SOURCE = 'https://dengshaomin86.github.io/template';

commander
  .version(version)
  .command('create <app-name>')
  .description(`create a new project by cli-ddd@${version}`)
  .action(async (projectName) => {
    logger.info(`create a new project by cli-ddd@${version}`);
    // 校验项目名称
    if (typeof projectName !== 'string') {
      logger.error('请输入项目名称');
      return;
    }

    // 校验项目目录
    let dir = path.join(process.cwd(), projectName);
    if (fs.existsSync(dir)) {
      logger.error('目录已存在');
      const result = await inquirer.prompt({
        name: 'projectName',
        message: '请重新输入应用名称',
        validate: (val) => {
          if (!val) return '不能为空';
          if (fs.existsSync(path.join(process.cwd(), val))) return '目录已存在';
          return true;
        },
      });
      projectName = result.projectName;
      dir = path.join(process.cwd(), projectName);
    }

    const choices = await getBranchesFromJson(TEMPLATE_SOURCE);
    if (!choices?.length) return;

    // 项目配置
    logger.info('项目配置:');
    const { templateUrl } = await inquirer.prompt([
      {
        type: 'list',
        name: 'templateUrl',
        message: '请选择要下载的模板:',
        choices,
        default: choices[0].value,
      },
      // {
      //   name: 'appId',
      //   message: '请输入应用ID',
      //   validate: (val) => {
      //     if (!val) return '请输入应用ID';
      //     return true;
      //   },
      // },
    ]);
    const choice = choices.find((v) => v.value === templateUrl);
    const filePath = path.join(dir, `${choice?.name}.zip`);
    const { flag, msg = '' } = await download(templateUrl, filePath);
    if (!flag) {
      logger.error(msg);
      return;
    }

    // 解压文件
    logger.info('正在解压文件');
    const result = await unzipFile(filePath, dir);
    if (!result) return;
    logger.success('文件解压完成');

    // 修改项目名称
    logger.info('正在处理文件内容');
    const pkg = fs.readFileSync(path.join(dir, 'package.json'), 'utf8');
    const prename = JSON.parse(pkg).name;
    if (prename) {
      replaceContent(dir, [{ source: prename, target: projectName }]);
    }
    logger.success('文件内容处理完成');
    logger.success('项目创建成功!');
  });

commander.parse(process.argv);
