const puppeteer = require("puppeteer");
const XLSX = require("xlsx");
const path = require("path");
const downloads_Dir = path.resolve(
  __dirname,
  "../",
  "downloads",
  "Spreadsheet"
);
const Data = require("../models/Data");

exports.getIndex = async (req, res, next) => {
  res.render("index", { layout: false });
};

exports.refreshData = async (req, res, next) => {
  const browser = await puppeteer.launch({ devtools: true });
  const page = await browser.newPage();
  let data = await Data.find({});
  console.log(data);
  // Parse Opintopolku
  // console.log(JSON.parse(process.env.OP_KEYS));

  const login_btn =
    "#content > div.Selection__flex-container___3uq7T > div:nth-child(1) > div.SelectionItem__link-container___33-f4 > a";
  const avainlukulista_btn =
    "#opidentityprovider-container > section > form > div:nth-child(1) > div.ds-form-row__item.ds-col.ds-col--sm-8 > div > div:nth-child(2) > label";
  await page.goto("https://opintopolku.fi/oma-opintopolku/");
  await page.waitForSelector(
    "#cookie-modal-content > div:nth-child(6) > button:nth-child(1)"
  );
  await page.click(
    "#cookie-modal-content > div:nth-child(6) > button:nth-child(1)"
  );
  await page.waitForSelector(login_btn);
  await page.click(login_btn);
  await page.waitForSelector("#osuuspankki");
  await page.click("#osuuspankki");
  await page.waitForSelector("#auth-device-userid-mobilekey");
  await page.focus("#auth-device-userid-mobilekey");
  await page.type("#auth-device-userid-mobilekey", process.env.OP_USERNAME);
  await page.click("#auth-device-submit-mobilekey");

  // try / catch here
  try {
    await page.waitForSelector("#continue-button");
  } catch (err) {
    await browser.close();
    console.log("in catch");
    res.render("index", {
      error: "You didn't verify yourself from the OP App! Please try again...",
    });
  }

  //! Will add my keys later so I don't have to verify myself from my phone everytime
  // {
  //   await page.waitForSelector(avainlukulista_btn);
  //   await page.click(avainlukulista_btn);
  //   await page.focus("#auth-device-userid-kr");
  //   await page.type("#auth-device-userid-kr", process.env.OP_USERNAME);
  //   await page.focus("#auth-device-password-kr");
  //   await page.type("#auth-device-password-kr", process.env.OP_PASSWORD);
  // }

  await page.waitForTimeout(600000);

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
