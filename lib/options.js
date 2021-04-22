// 交互命令
const inquirer = require('inquirer');

let optionsArr = [{
        name: "template",
        message: "请选择要下载的模板?(demo1|demo2)",
        default: 'demo1'
    },
    {
        name: "clientName",
        message: "请输入租户ID",
        default: 'clientName'
    }
]

module.exports = () => {
    return inquirer.prompt(optionsArr);
}