const puppeteer = require('puppeteer');

(async () => {

  //创建浏览器
  const browser = await puppeteer.launch({
    //关闭无头模式
    headless: false,
    //保存用户数据
    userDataDir: "./data",
  });

  const page = await browser.newPage();

  //访问页面
  await page.goto(
    'https://www.bilibili.com/v/music/cover'
  );

  //等待页面加载，增强鲁棒性
  await page.waitForSelector(
    ".bili-video-card__info.__scale-disable > div > h3 > a"
  );

  let titles = await page.$$eval(
    ".bili-video-card__info.__scale-disable > div > h3 > a",
    (links) => links.map((x) => x.innerText)
  );

  console.log(titles);

  // await browser.close();
})();