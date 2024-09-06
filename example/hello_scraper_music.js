const puppeteer = require("puppeteer");
const fs = require("fs");

(async () => {
  let data = [];

  const browser = await puppeteer.launch({
    headless: false,
    userDataDir: "./data",
  });
  const page = await browser.newPage();

  for (let mo = 1; mo <= 1; mo++) {
    for (let pg = 1; pg <= 10; pg++) {
      mo = mo.toString().padStart(2, "0");
      await page.goto(
        // "https://www.bilibili.com/v/music/cover/?spm_id_from=333.5.b_7375626e6176.3#" +
        //   `/all/click/0/${pg}/2020-${mo}-01,2020-${mo}-29`
        'https://www.bilibili.com/v/music/cover'
      );

      await page.waitForSelector(
        ".bili-video-card__info.__scale-disable > div > h3 > a"
      );

      let titles = await page.$$eval(
        ".bili-video-card__info.__scale-disable > div > h3 > a",
        (links) => links.map((x) => x.innerText)
      );

      console.log(titles);
      data = data.concat(titles);
    }
  }

  fs.writeFile("data.json", JSON.stringify(data, null, "\t"), function (err) {
    if (err) {
      console.log(err);
    }
  });

  await browser.close();
})();
