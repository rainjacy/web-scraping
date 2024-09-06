import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

// 目标网页
const url = 'https://m.todoen.com/books/details.html?b=41';

// 创建文件夹的函数
function createFolder(folderName) {
  const folderPath = path.join(process.cwd(), folderName);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
    console.log(`创建文件夹：${folderName}`);
  } else {
    console.log(`文件夹已存在：${folderName}`);
  }
}

// 主函数：使用 Puppeteer 获取媒体文件链接并下载
(async () => {
  // 启动浏览器
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // 打开目标网页
  await page.goto(url, { waitUntil: 'networkidle2' });

  // 获取所有 `<div class="audiolist">` 标签下的 `<p class="audio-tit">` 标签中的文本
  const folderNames = await page.evaluate(() => {
    const names = [];
    document.querySelectorAll('div.audiolist p.audio-tit').forEach((p) => {
      const text = p.textContent.trim();
      if (text) {
        names.push(text);
      }
    });
    return names;
  });

  // 关闭浏览器
  await browser.close();

  // 创建文件夹
  if (folderNames.length > 0) {
    console.log(`找到 ${folderNames.length} 个音频标题，开始创建文件夹...`);

    folderNames.forEach(folderName => {
      createFolder(folderName);
    });

    console.log('所有文件夹创建完成');
  } else {
    console.log('未找到音频标题');
  }
})();
