import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

// 目标网页
// const url = 'https://m.todoen.com/books/details.html?b=41'; // KET
const url = 'https://m.todoen.com/books/details.html?b=42'; // PET
const todoenURL = 'https://static-image.todoen.com/';

// 创建文件夹函数
function createFolder(folderPath) {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
    console.log(`创建音频文件夹: ${folderPath}`);
  }
}

// 下载文件的函数
async function downloadFile(fileUrl, outputLocationPath) {
  const res = await fetch(fileUrl);
  const fileStream = fs.createWriteStream(outputLocationPath);
  await new Promise((resolve, reject) => {
    res.body.pipe(fileStream);
    res.body.on("error", reject);
    fileStream.on("finish", resolve);
  });
  console.log(`下载文件 ${fileUrl} 到 ${outputLocationPath}`);
}

// 主函数：使用 Puppeteer 获取数据并下载音频文件/视频文件
(async () => {
  // 启动浏览器
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // 打开目标网页
  await page.goto(url, { waitUntil: 'networkidle2' });

  // 获取页面中的音频文件夹、文件名和音频链接/视频链接
  const audioData = await page.evaluate(() => {
    const data = [];

    // 遍历每个 <div class="audiolist">
    document.querySelectorAll('div.audiolist').forEach((audioList) => {
      const folderName = audioList.querySelector('p.audio-tit').textContent.trim();

      // 获取 <ul><li> 下的文件名和音频链接/视频链接
      const audioFiles = [];
      const videoFiles = [];
      audioList.querySelectorAll('ul li').forEach((li) => {
        const fileName = li.querySelector('p span.name')?.textContent.trim();
        const audioLink = li.querySelector('a.audio-num')?.getAttribute('data-src');
        const videoLink = li.querySelector('a.video-play-icon')?.getAttribute('data-src');

        if (fileName && audioLink) {
          audioFiles.push({ fileName, audioLink });
        }

        if (fileName && videoLink) {
          videoFiles.push({ fileName, videoLink });
        }
      });

      // 只将有音频文件或视频文件的文件夹添加到数据中
      if (audioFiles.length > 0 || videoFiles.length > 0) {
        data.push({ folderName, audioFiles, videoFiles });
      }
    });

    return data;
  });

  // 关闭浏览器
  await browser.close();

  // 下载音频文件/视频文件
  for (const { folderName, audioFiles, videoFiles } of audioData) {
    const audioFolderPath = path.join(process.cwd(), '../audio/' + folderName);
    const videoFolderPath = path.join(process.cwd(), '../video/' + folderName);

    // 创建音频文件夹/视频文件夹
    if (audioFiles.length > 0) {
      createFolder(audioFolderPath);
    }
    if (videoFiles.length > 0) {
      createFolder(videoFolderPath);
    }

    // 下载每个音频文件
    for (const { fileName, audioLink } of audioFiles) {
      const audioLink2 = todoenURL + audioLink;
      const outputPath = path.join(audioFolderPath, `${fileName}.mp3`);
      console.log(`正在下载 ${fileName} 来自 ${audioLink2}...`);
      await downloadFile(audioLink2, outputPath);
    }

    // 下载每个视频文件
    for (const { fileName, videoLink } of videoFiles) {
      const videoLink2 = todoenURL + videoLink;
      const outputPath = path.join(videoFolderPath, `${fileName}.mp4`);
      console.log(`正在下载 ${fileName} 来自 ${videoLink2}...`);
      await downloadFile(videoLink2, outputPath);
    }

  }

  console.log('所有音频/视频文件已下载完成');
})();
