const fs = require('fs');
const path = require('path');
const downloadGitRepo = require('download-git-repo'); // 下载配置的模板
const ora = require('ora'); // 下载动画
const { log } = require('../util/log');
const { handle_content, get_file_type } = require('../util/handle_file');

function download_template({ context, opts, template }) {
  const { name } = opts;
  const { url } = template;
  if (!url) return false;

  log.info('开始拉取模板');
  const spinner = ora('正在拉取模板...');
  spinner.start();

  // 拉取模板
  downloadGitRepo(
    url,
    name,
    {
      clone: false,
    },
    async (err) => {
      spinner.stop();
      if (!err) {
        log.success('拉取模板成功');
        log.info('开始处理文件内容');
        handle_file(context, opts);
        log.success('创建成功');
      } else {
        log.error(err);
      }
      process.exit(1);
    },
  );
}

// 处理文件内容
function handle_file(context, opts) {
  const files = fs.readdirSync(context);

  for (const filename of files) {
    const file_ctx = path.resolve(context, filename);
    if (get_file_type(file_ctx) === 'directory') {
      handle_file(file_ctx, opts);
    } else {
      // 替换模板字符串
      const content = fs.readFileSync(file_ctx, 'utf-8');
      const result = handle_content({ context: file_ctx, content, opts });
      fs.writeFileSync(file_ctx, result);
    }
  }
}

module.exports = {
  download_template,
};
