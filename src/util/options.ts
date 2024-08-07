import inquirer from 'inquirer';
import { log } from './log';

export const options = (choices: { value: any }[]) => {
  log.info('项目配置：');
  return inquirer.prompt([
    {
      type: 'list',
      name: 'template_url',
      message: '请选择要下载的模板：',
      choices,
      default: choices[0].value,
    },
    // {
    //   name: 'app_id',
    //   message: '请输入应用ID',
    //   validate: (val) => {
    //     if (!val) return '请输入应用ID';
    //     return true;
    //   },
    // },
  ]);
};
