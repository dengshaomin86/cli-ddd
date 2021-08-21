// 下载动画
const ora = require('ora');
const child_process = require('child_process');

const clone_template = (name, opts) => {
	const spinner = ora('正在拉取模板...');
    spinner.start();
	
	child_process.exec('git clone https://github.com/dengshaomin86/cli-demo1.git', function(status, output) {
		console.log('Exit status:', status);
		console.log('Program output:', output);
		spinner.stop();
	});
};

module.exports = clone_template;
