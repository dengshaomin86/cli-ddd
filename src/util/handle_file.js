const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
const { template_data } = require('../config');

// 是否是可用文件路径
function is_available_directory(context) {
  if (!context || typeof context !== 'string') return false;
  if (!fs.existsSync(context)) return false;
  return true;
}

// 获取文件类型
function get_file_type(context) {
  try {
    const stat = fs.statSync(context);
    if (stat.isDirectory()) return 'directory';
    if (stat.isFile()) return mime.getType(context) || '';
    return 'unknow';
  } catch (e) {
    return 'unknow';
  }
}

// 复制文件
function copy_files(context, target, opts) {
  if (!fs.existsSync(target)) fs.mkdirSync(target);
  const basename = path.basename(context);
  if (get_file_type(context) === 'directory') {
    const _target = path.join(target, basename);
    const files = fs.readdirSync(context);
    for (const filename of files) {
      const _ctx = path.join(context, filename);
      copy_files(_ctx, _target, opts);
    }
  } else {
    // 替换模板字符串
    const content = fs.readFileSync(context, 'utf-8');
    const result = handle_content({ context, content, opts });
    fs.writeFileSync(path.join(target, basename), result);
  }
}

// 处理文件内容
function handle_content({ context, content, opts }) {
  const extname = ['.js', '.json', '.vue', '.md'];
  if (!extname.includes(path.extname(context))) return content;
  const template = Handlebars.compile(content);
  return template({ appName: opts.name, ...template_data });
}

// 删除文件
function delete_file(context) {
  if (!is_available_directory(context)) return;
  const stat = fs.statSync(context);
  if (stat.isDirectory()) {
    const files = fs.readdirSync(context);
    files.forEach((filename) => {
      delete_file(path.join(context, filename));
    });
    fs.rmdirSync(context);
  } else if (stat.isFile()) {
    fs.unlinkSync(context);
  } else {
    throw Error(`无法删除：${context}`);
  }
}

// 移动项目文件到根目录
function move_project_file({ source, target, opts }) {
  if (!is_available_directory(source)) return;
  if (!is_available_directory(target)) return;
  const files = fs.readdirSync(source);
  if (!files.length) return;
  const _ctx = path.resolve(source, files[0]);
  if (files.length === 1 && get_file_type(_ctx) === 'directory') {
    move_project_file({ source: _ctx, target, opts });
  } else {
    for (const filename of files) {
      copy_files(path.resolve(source, filename), target, opts);
    }
  }
}

module.exports = {
  delete_file,
  move_project_file,
};
