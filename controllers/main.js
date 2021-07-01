const puppeteer = require("puppeteer");
const XLSX = require("xlsx");
const path = require("path");
const downloads_Dir = path.resolve(__dirname, "../", "downloads");
const Data = require("../models/Data");

exports.getIndex = async (req, res, next) => {
  res.render("index", { layout: false });
};

exports.refreshData = async (req, res, next) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  let data = Data.find({});
  console.log(data);
  // Parse Opintopolku

  // Parse xlsb
  await page.goto(
    "https://vipunen.fi/fi-fi/_layouts/15/xlviewer.aspx?id=/fi-fi/Raportit/Haku%20ja%20valinta%20-%20korkeakoulu%20%20-%20live.xlsb",
    { waitUntil: "load" }
  );

  console.log("Fetching data...");

  await page.waitForTimeout(14000);

  let rect = await page.$$eval(".di-clp", (arr) => {
    const { x, y } = arr[arr.length - 1].getBoundingClientRect();
    return { x, y };
  });

  await page.mouse.click(rect.x, rect.y);
  await page.mouse.click(rect.x, rect.y, { clickCount: 2, delay: 300 });

  await page.waitForTimeout(3000);

  rect = await page.$$eval(".ewr-glcontainer-ltr", (elems) => {
    let elem = elems[1].children[elems[1].children.length - 1];
    elem.scrollIntoView();
    const { x, y } = elem.getBoundingClientRect();
    return { x, y };
  });
  await page.waitForTimeout(3000);

  rect = await page.$$eval(".ewr-glcontainer-ltr", (elems) => {
    console.log(elems);
    let elem = elems[1].children[elems[1].children.length - 7];
    console.log(elem);
    const { x, y } = elem.getBoundingClientRect();
    return { x, y };
  });

  await page.mouse.click(rect.x, rect.y);
  await page.mouse.click(rect.x, rect.y, { clickCount: 2, delay: 100 });
  await page.mouse.click(rect.x, rect.y, { clickCount: 2, delay: 100 });

  await page._client.send("Page.setDownloadBehavior", {
    behavior: "allow",
    downloadPath: downloads_Dir,
  });
  await page.waitForTimeout(2000);
  await page.waitForSelector("[title='Asetukset']");
  await page.click("[title='Asetukset']", { clickCount: 2, delay: 500 });
  await page.waitForTimeout(2000);
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
  let paikkoja_jäljellä = workSheet["B103"].v - workSheet["F103"].v;
  console.log(`Paikkoja jäljellä: ${paikkoja_jäljellä}`);

  await browser.close();
  res.render("index", { layout: false, paikkoja_jäljellä });
};
