const puppeteer = require("puppeteer");
const XLSX = require("xlsx");
const path = require("path");
const downloads_Dir = path.resolve(__dirname, "../", "downloads");

exports.updateData = async (req, res, next) => {
  const browser = await puppeteer.launch({ devtools: true });
  const page = await browser.newPage();
  await page.goto(
    "https://vipunen.fi/fi-fi/_layouts/15/xlviewer.aspx?id=/fi-fi/Raportit/Haku%20ja%20valinta%20-%20korkeakoulu%20%20-%20live.xlsb",
    { waitUntil: "load" }
  );

  await page.waitForTimeout(14000);

  let rect = await page.$$eval(".di-clp", (arr) => {
    const { x, y } = arr[arr.length - 1].getBoundingClientRect();
    return { x, y };
  });

  await page.mouse.click(rect.x, rect.y);
  await page.mouse.click(rect.x, rect.y, { clickCount: 2, delay: 300 });

  await page.$$eval(".ewr-glcontainer-ltr", (elems) => {
    console.log(elems);
  });
  //   await page.$$eval("#gridRows > .ewr-nglr", (elems) => {
  //     elems[elems.length - 1].scrollIntoView({ behavior: "smooth" });
  //     console.log(elems[elems.length - 1]);
  //   });
  //! Scroll down

  await page.waitForTimeout(600000);

  await page._client.send("Page.setDownloadBehavior", {
    behavior: "allow",
    downloadPath: downloads_Dir,
  });
  await page.waitForSelector("[title='Asetukset']");
  await page.click("[title='Asetukset']");
  await page.waitForSelector(
    "#m_excelWebRenderer_nov_ewaCtl_miDownloadASnapshot"
  );
  await page.click("#m_excelWebRenderer_nov_ewaCtl_miDownloadASnapshot");
  await page.waitForTimeout(3000);

  let workBook = XLSX.readFile(
    path.join(downloads_Dir, "Haku ja valinta - korkeakoulu  - live.xlsb")
  );
  let sheetName = workBook.SheetNames[0];
  let workSheet = workBook.Sheets[sheetName];
  //   let paikkoja_jäljellä = workSheet["B103"];
  //   console.log(paikkoja_jäljellä.v);
  //   console.log(workSheet);

  //   console.log(test);
  await page.waitForTimeout(6000000);
  //   await browser.close();
  res.render("index", { layout: false });
};
