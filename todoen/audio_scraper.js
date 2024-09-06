import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch'; // 使用 import 代替 require

// 目标网页
const url = 'https://m.todoen.com/books/details.html?b=41';

// 下载文件的函数
async function downloadFile(fileUrl, outputLocationPath) {
  const res = await fetch(fileUrl);
  const fileStream = fs.createWriteStream(outputLocationPath);
  await new Promise((resolve, reject) => {
    res.body.pipe(fileStream);
    res.body.on("error", reject);
    fileStream.on("finish", resolve);
  });
  console.log(`Downloaded ${fileUrl} to ${outputLocationPath}`);
}

// 主函数：使用 Puppeteer 获取媒体文件链接并下载
(async () => {
  // 启动浏览器
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // 打开目标网页
  await page.goto(url, { waitUntil: 'networkidle2' });

  // 获取 `<a>` 标签中 `data-src` 属性的音频链接
  const mediaLinks = await page.evaluate(() => {
    const links = [];
    document.querySelectorAll('a.audio-num').forEach((a) => {
      const src = a.getAttribute('data-src');
      if (src) {
        links.push(src);
      }
    });
    return links;
  });

  // 关闭浏览器
  await browser.close();

  // 如果找到音频文件链接，下载它们
  if (mediaLinks.length > 0) {
    console.log(`Found ${mediaLinks.length} media files. Downloading...`);

    for (const link of mediaLinks) {
      const fileName = path.basename(link);
      const outputPath = path.join(process.cwd(), fileName); // 使用 process.cwd() 替代 __dirname
      await downloadFile(link, outputPath);
    }

    console.log('所有媒体文件下载完成');
  } else {
    console.log('未找到音频文件');
  }
})();
