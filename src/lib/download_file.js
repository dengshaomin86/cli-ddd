const fs = require('fs');
const path = require('path');
const request = require('request');
const compressing = require('compressing');
const { log } = require('../util/log');
const { delete_file, move_project_file } = require('../util/handle_file');
const { zip_file } = require('../config.js');
const { url, filename } = zip_file;

// 下载文件
async function download_file({ name, opts, context }) {
  log.info('开始下载文件');
  const zip_file_path = path.join(context, filename);
  const stream = fs.createWriteStream(zip_file_path);
  request(url)
    .pipe(stream)
    .on('close', async (err) => {
      if (err) {
        log.error('文件下载失败');
        return;
      }
      log.success('文件下载完成');
      await unzipFile({ zip_file_path, context });
    });
}

// 解压文件
async function unzipFile({ zip_file_path, context }) {
  log.info('开始解压文件');
  const unzip_ctx = path.resolve(context, 'unzip');
  await compressing.zip.uncompress(zip_file_path, unzip_ctx);
  log.success('文件加压完成');
  // 删除压缩包
  delete_file(zip_file_path);
  log.info('文件移动到根目录');
  move_project_file({ target: context, source: unzip_ctx });
  // 删除解压文件
  delete_file(unzip_ctx);
}

module.exports = {
  download_file,
};
