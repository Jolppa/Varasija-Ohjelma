const puppeteer = require("puppeteer");
const XLSX = require("xlsx");
const dateformat = require("dateformat");
const path = require("path");
const downloads_Dir = path.resolve(
  __dirname,
  "../",
  "downloads",
  "Spreadsheet"
);
const Data = require("../models/Data");

exports.getIndex = async (req, res, next) => {
  let data = await Data.findOne({}).lean();
  res.render("index", { layout: false, data });
};

exports.refreshData = async (req, res, next) => {
  try {
    console.log("Refreshing data...");
    const browser = await puppeteer.launch({
      devtools: true,
    });
    const page = await browser.newPage();
    let data = await Data.findOne({});
    // console.log(data);
    // Parse Opintopolku

    const login_btn =
      "#content > div.Selection__flex-container___3uq7T > div:nth-child(1) > div.SelectionItem__link-container___33-f4 > a";
    const avainlukulista_btn =
      "#opidentityprovider-container > section > form > div:nth-child(1) > div.ds-form-row__item.ds-col.ds-col--sm-8 > div > div:nth-child(2) > label";
    const turku_varasija =
      "#hakemus-list > li > application > div > form > section > valintatulos > div > div:nth-child(2) > div.hakutoive-grid > div.hakutoive-grid__valintatila.hakutoive-grid__hakutoive-grid-item > div > span";
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

    await page.waitForNavigation({ waitUntil: "networkidle2" });
    await page.waitForSelector("#continue-button", { visible: true });

    await page.click("#continue-button");
    // await page.waitForNavigation({});
    await page.waitForSelector(turku_varasija);
    let varasija = await page.$eval(turku_varasija, (elem) => {
      return elem.textContent;
    });
    varasija = +varasija.match(/\d+/g)[0];

    console.log(varasija);

    //! Will add my keys later so I don't have to verify myself from my phone everytime
    // {
    //   await page.waitForSelector(avainlukulista_btn);
    //   await page.click(avainlukulista_btn);
    //   await page.focus("#auth-device-userid-kr");
    //   await page.type("#auth-device-userid-kr", process.env.OP_USERNAME);
    //   await page.focus("#auth-device-password-kr");
    //   await page.type("#auth-device-password-kr", process.env.OP_PASSWORD);
    // }

    // await page.waitForTimeout(600000);

    // Parse xlsb
    await page.goto(
      "https://vipunen.fi/fi-fi/_layouts/15/xlviewer.aspx?id=/fi-fi/Raportit/Haku%20ja%20valinta%20-%20korkeakoulu%20%20-%20live.xlsb",
      { waitUntil: "load" }
    );

    console.log("Parsing .xlsb file");

    await page.waitForTimeout(14000);
    await page.waitForSelector("#gridRows", { visible: true });

    let rect = await page.$$eval(".di-clp", (arr) => {
      console.log(arr);
      const { x, y } = arr[2].getBoundingClientRect();
      return { x, y };
    });

    await page.mouse.click(rect.x, rect.y);
    await page.mouse.click(rect.x, rect.y, { clickCount: 2, delay: 300 });

    await page.waitForTimeout(3000);

    await page.waitForSelector(".ewr-glcontainer-ltr", { visible: true });

    rect = await page.$$eval(".di-clp", (elems) => {
      elems[24].scrollIntoView();
      const { x, y } = elems[24].getBoundingClientRect();
      return { x, y };
    });
    await page.waitForTimeout(3000);

    await page.mouse.click(rect.x, rect.y);
    await page.mouse.click(rect.x, rect.y, { clickCount: 2, delay: 100 });
    await page.mouse.click(rect.x, rect.y, { clickCount: 2, delay: 100 });

    await page._client.send("Page.setDownloadBehavior", {
      behavior: "allow",
      downloadPath: downloads_Dir,
    });
    await page.waitForTimeout(2000);
    await page.waitForSelector("#m_excelWebRenderer_nov_bt_options", {
      visible: true,
    });

    await page.waitForSelector("[title='Asetukset']");
    await page.click("[title='Asetukset']", { clickCount: 2, delay: 500 });
    await page.waitForTimeout(2000);
    await page.waitForSelector(
      "#m_excelWebRenderer_nov_ewaCtl_miDownloadASnapshot",
      { visible: true }
    );
    await page.click("#m_excelWebRenderer_nov_ewaCtl_miDownloadASnapshot");
    await page.waitForTimeout(3000);

    let workBook = XLSX.readFile(
      path.join(downloads_Dir, "Haku ja valinta - korkeakoulu  - live.xlsb")
    );
    let sheetName = workBook.SheetNames[0];
    let workSheet = workBook.Sheets[sheetName];
    let paikkoja_jäljellä = workSheet["B102"].v - workSheet["F102"].v;
    console.log(`Paikkoja jäljellä: ${paikkoja_jäljellä}`);
    let päivämäärä = dateformat(undefined, "dd.mm.yy, HH:MM:ss");
    await browser.close();
    data = { varasija, paikkoja_jäljellä, päivämäärä };
    !Data.findOne({})
      ? await new Data(data).save()
      : await Data.updateOne({}, data);
    res.render("index", { layout: false, data });
  } catch (err) {
    console.log("in catch");
    console.log(`Error Message: ${err.message}`);
    if (err.message.includes("#continue-button"))
      err.message =
        "You didn't verify yourself from the OP App! Please try again...";
    if (err.message.includes("#gridRows")) err.message = "Vipunen on offline";
    else {
      err.message = "Something went wrong! Please try again...";
    }
    next(err);
  }
};
