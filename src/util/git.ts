import fs from 'fs-extra';
import https from 'https';
import { htmlparse } from './htmlparse';

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

export const getBranchesFromJson = async (url: string) => {
  return await fetch(`${url}/list.json`)
    .then(async (res) => {
      const list: string[] = await res.json();
      return list.map((name) => {
        return { name, type: 'zip', value: `${url}/${name}.zip` };
      });
    })
    .catch(() => []);
};

export const download = (url: string, dest: string) => {
  return new Promise<{ flag: boolean; msg?: string }>((resolve) => {
    const req = https.get(url, (res) => {
      if (res.statusCode !== 200) {
        resolve({ flag: false, msg: `code: ${res.statusCode}` });
        return;
      }

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
