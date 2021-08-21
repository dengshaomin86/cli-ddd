// 下载配置的模板
const downLoad = require('download-git-repo');
// 下载动画
const ora = require('ora');
const chalk = require('chalk');
const writeFileTree = require('../util/writeFileTree');
const getPkg = require('../util/getPkg');
const getMain = require('../util/getMain');
const path = require('path');
const Handlebars = require('handlebars');

let urlObj = {
  demo1: 'dengshaomin86/cli-demo1',
  demo2: 'dengshaomin86/cli-demo2',
  demo3: 'https://www.baidu.com/img/flexible/logo/pc/result.png',
};

let download_template = (name, opts) => {
  const { template, clientName } = opts;
  const url = urlObj[template];
  !url && (console.log(chalk.red('项目模板不存在\n')), process.exit(1));

  const cwd = opts.cwd || process.cwd();
  const context = path.resolve(cwd, name || '.');

  console.log(context);

  const spinner = ora('正在拉取模板...');
  spinner.start();

  downLoad(
    url,
    name,
    {
      clone: false,
    },
    async (err) => {
      let pkg_default = getPkg(context);

      const pkg = {
        ...pkg_default,
        version: '1.0.0',
        name,
      };

      // write package.json
      await writeFileTree(context, {
        'package.json': JSON.stringify(pkg, null, 2),
      });

      const main_default = getMain(context);
      const template = Handlebars.compile(main_default);
      const mainContent = template({ ClientName: clientName });

      // write main.js
      await writeFileTree(context, {
        'main.js': mainContent,
      });

      spinner.stop();
      console.log(err ? err : '项目创建成功');
      process.exit(1);
    },
  );
};

module.exports = download_template;
