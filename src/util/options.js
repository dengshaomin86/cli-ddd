// 交互命令
const inquirer = require('inquirer');
const { log } = require('./log');
const { templates } = require('../config');

let optionsArr = [
  {
    type: 'list',
    name: 'template_id',
    message: '请选择要下载的模板：',
    choices: templates,
    default: templates[0].value,
  },
  {
    name: 'app_id',
    message: '请输入应用ID',
    validate: (val) => {
      if (!val) return '请输入应用ID';
      return true;
    },
  },
];

module.exports = () => {
  log.info('项目配置：');
  return inquirer.prompt(optionsArr);
};
