// 交互命令
const inquirer = require('inquirer');
const { log } = require('../util/log');

let optionsArr = [
  {
    name: 'template',
    message: '请选择要下载的模板?(demo1|demo2)',
    default: 'demo1',
  },
  {
    name: 'clientName',
    message: '请输入租户ID',
    validate: (val) => {
      if (!val) {
        return '請輸入租戶ID';
      }
      return true;
    },
  },
];

module.exports = () => {
  log.info('项目配置：');
  return inquirer.prompt(optionsArr);
};
