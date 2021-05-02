#! /usr/bin/env node

// 创建命令
const program = require("commander");
// 字体颜色
const chalk = require("chalk");
const options = require("./lib/options");
const download_template = require("./lib/download_template");
const download_file = require("./lib/download_file");


program
	.version("0.0.1")
	.command("create <app-name>")
	.description('create a new project by test-cli')
	.action(async (name) => {
		typeof name !== 'string' && (console.log(chalk.red('请输入项目名称')), process.exit(1));
		console.log(chalk.yellow('初始化模板 \n'));
		const opts = await options();
		await download_file(name, opts);
	});

program.parse(process.argv);
