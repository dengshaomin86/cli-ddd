/**
 * utils
 */

import fs from 'fs-extra';
import path from 'path';
import compressing from 'compressing';
import { log } from './log';

const TYPES = ['js', 'ts', 'json', 'vue', 'md', 'html', 'css'];

/**
 * 解压文件
 * @param zip_file_path 压缩包路径
 * @param dir 解压目标文件夹
 * @returns
 */
export async function unzipFile(zip_file_path: string, dir: string) {
  log.info('正在解压文件');
  const result = await compressing.zip
    .uncompress(zip_file_path, dir)
    .then(() => null)
    .catch((err) => err.message);
  if (result) {
    log.error(result);
    return false;
  }
  log.success('文件解压完成');
  // 删除压缩包
  fs.removeSync(zip_file_path);
  return true;
}

/**
 * 替换文件内容
 * @param dir 要替换的文件根目录
 * @param rules 规则
 */
export function replaceContent(dir: string, rules: { source: string; target: string }[]) {
  const files = fs.readdirSync(dir);
  for (const filename of files) {
    const dest = path.join(dir, filename);
    const stat = fs.statSync(dest);
    if (stat.isDirectory()) {
      replaceContent(dest, rules);
      continue;
    }
    if (stat.isFile() && TYPES.includes(path.parse(dest).ext.slice(1).toLowerCase())) {
      const content = fs.readFileSync(dest, 'utf8');
      let _content = '';
      for (const rule of rules) {
        const reg = new RegExp(rule.source, 'g');
        _content = content.replace(reg, rule.target);
      }
      fs.writeFileSync(dest, _content, 'utf8');
    }
  }
}
