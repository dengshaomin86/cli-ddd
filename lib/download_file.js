const fs = require("fs");
const path = require("path");
const request = require("request");
const chalk = require("chalk");
const unzip = require("unzip");

const downlad_file = (name, opts) => {
    // 创建文件目录
    const cwd = opts.cwd || process.cwd();
    const context = path.resolve(cwd, name || '.');

    if (fs.existsSync(context)) {
        console.log(chalk.red("目录已存在"));
        return false;
    }
    fs.mkdirSync(context);

    // 下载文件
    const filename = "cli-demo1-master.zip";
    const url = "https://codeload.github.com/dengshaomin86/cli-demo1/zip/refs/heads/master";
    const fileDirectory = path.join(context, filename);
    const stream = fs.createWriteStream(fileDirectory);
    request(url).pipe(stream).on("close", (err) => {
        if (err) {
            console.log(chalk.red("文件下载失败"));
            return;
        }
        console.log("文件下载完成");
        unzipFile(fileDirectory, context);
    });

    function unzipFile(fileDirectory, context) {
        fs.createReadStream(fileDirectory).pipe(unzip.Extract({
            path: context + "/unzip"
        }));
    }
};

module.exports = downlad_file;
