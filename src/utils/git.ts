import fs from 'fs-extra';
import https from 'https';
import logger from '../libs/logger';
import { htmlparse } from '../libs/htmlparse';

/**
 * 获取仓库分支列表
 * @param url https://github.com/dengshaomin86/template
 * @returns
 * zip url: https://codeload.github.com/dengshaomin86/cli-ddd/zip/refs/heads/master
 */
export const getBranches = (url: string) => {
  return new Promise<{ flag: boolean; data: string[]; msg?: string }>((resolve) => {
    const req = https.get(url, (res) => {
      if (res.statusCode !== 200) {
        resolve({ flag: false, data: [], msg: `code: ${res.statusCode}` });
        return;
      }

      let chunks = '';
      res.on('data', (chunk: any) => {
        chunks += chunk;
      });

      res.on('end', () => {
        const doc = htmlparse(chunks);
        const list: string[] =
          doc
            .querySelector('.ilcYjX')
            ?.querySelectorAll('li')
            .map((v) => v.innerText)
            .filter((v) => v !== 'master') || [];
        resolve({ flag: true, data: list });
      });
    });

    req.on('error', async (err) => {
      resolve({ flag: false, data: [], msg: err.message });
    });

    req.end();
  });
};

export const getBranchesFromJson = (url: string) => {
  return new Promise<{ name: string; type: string; value: string }[]>((resolve) => {
    const req = https
      .get(`${url}/list.json`, (res) => {
        if (res.statusCode !== 200) {
          logger.error(`code: ${res.statusCode}`);
          resolve([]);
          return;
        }

        let chunks = '';
        res.on('data', (chunk: any) => {
          chunks += chunk;
        });

        res.on('end', () => {
          const list: string[] = JSON.parse(chunks);
          resolve(list.map((name) => ({ name, type: 'zip', value: `${url}/${name}.zip` })));
        });
      })
      .on('error', (err) => {
        logger.error(err.message);
        resolve([]);
      });
    req.end();
  });
};

export const download = (url: string, dest: string) => {
  return new Promise<{ flag: boolean; msg?: string }>((resolve) => {
    const req = https.get(url, (res) => {
      if (res.statusCode !== 200) {
        resolve({ flag: false, msg: `code: ${res.statusCode}` });
        return;
      }

      fs.ensureFileSync(dest);
      const stream = fs.createWriteStream(dest, { autoClose: true });
      stream
        .on('finish', () => {
          stream.close();
          resolve({ flag: true });
        })
        .on('error', (err) => {
          fs.unlink(dest);
          resolve({ flag: false, msg: err.message });
        });
      res.pipe(stream);
    });

    req.on('error', (err) => {
      resolve({ flag: false, msg: err.message });
    });

    req.end();
  });
};
