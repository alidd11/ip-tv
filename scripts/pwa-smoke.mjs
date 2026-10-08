import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { chromium } from "playwright";

const base="http://127.0.0.1:4173/web-pwa/";
await fs.mkdir("artifacts/pwa", {recursive:true});
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({
  viewport:{width:393,height:852},
  deviceScaleFactor:2,
  isMobile:true,
  hasTouch:true,
});
const errors=[];
page.on("pageerror",error=>errors.push(error.message));
try {
  const res=await page.goto(base,{waitUntil:"networkidle"});
  assert.equal(res.status(),200,"PWA must load");
  await page.locator("#directoryStatus").waitFor({state:"visible"});
  await page.waitForFunction(()=>document.querySelector("#directoryStatus")?.textContent?.includes("channel"));
  assert.equal(await page.locator("#heroTitle").textContent(),"Sky News");
  assert.equal(await page.locator("#heroPrimary").textContent(),"Watch on official site");
  const countries=await page.locator("#directoryCountry option").count();
  assert.ok(countries>=200,"global country selection needs 200+ countries");
  assert.equal(await page.locator(".tab[data-section]").count(),4);
  await page.locator('.tab[data-section="explore"]').click();
  assert.equal(await page.locator('.tab[data-section="explore"]').getAttribute("aria-current"),"page");
  const gbResults=await page.locator("#directoryResults .directory-card").count();
  assert.ok(gbResults>0,"UK results expected");

  const metrics=await page.evaluate(()=>({viewport:innerWidth,scroll:document.documentElement.scrollWidth}));
  assert.ok(metrics.scroll<=metrics.viewport+1,"Mobile page overflow: "+JSON.stringify(metrics));
  await page.locator('.tab[data-section="home"]').click();
  await page.waitForTimeout(250);
  await page.screenshot({path:"artifacts/pwa/iphone-home.png",fullPage:false});
  await page.locator("#directoryCountry").selectOption("TR");
  await page.waitForFunction(()=>{
    const selector=document.querySelector("#directoryCountry");
    const name=selector?.selectedOptions?.[0]?.textContent?.split(" · ")[0];
    const status=document.querySelector("#directoryStatus")?.textContent||"";
    return selector?.value==="TR"&&name&&status.includes("in "+name);
  });
  await page.locator("#directorySearch").fill("TRT");
  await page.waitForTimeout(200);
  const text=await page.locator("#directoryStatus").textContent();
  assert.match(text,/TRT/i);
  const cards=page.locator("#directoryResults .directory-card");
  assert.ok(await cards.count()>0,"TRT results expected");
  await cards.first().click();
  assert.equal(await page.locator("#sheet").evaluate(e=>e.classList.contains("hidden")),false);
  const savedName=await page.locator("#sheetTitle").textContent();
  await page.locator("#sheetSave").click();
  await page.locator("#sheetSave").waitFor({state:"visible"});
  assert.match(await page.locator("#sheetSave").textContent(),/Remove from saved/);
  assert.equal(await page.locator("#savedResults .saved-card").count(),1);
  await page.locator("[data-close-sheet]").last().click();
  await page.reload({waitUntil:"networkidle"});
  await page.waitForFunction(()=>document.querySelectorAll("#savedResults .saved-card").length===1);
  assert.equal(await page.locator("#savedResults .saved-card .directory-card-name").textContent(),savedName);
  await page.locator('.tab[data-section="saved"]').click();
  assert.equal(await page.locator('.tab[data-section="saved"]').getAttribute("aria-current"),"page");
  await page.locator("#savedResults .saved-card").first().click();
  await page.locator("#sheetSave").click();
  assert.equal(await page.locator("#savedResults .saved-card").count(),0);
  await page.locator("[data-close-sheet]").last().click();
  await page.locator("#directory").scrollIntoViewIfNeeded();
  await page.screenshot({path:"artifacts/pwa/iphone-turkey-search.png",fullPage:false});

  const desktop=await browser.newPage({viewport:{width:1440,height:900}});
  await desktop.goto(base,{waitUntil:"networkidle"});
  await desktop.waitForFunction(()=>document.querySelector("#directoryStatus")?.textContent?.includes("channel"));
  await desktop.screenshot({path:"artifacts/pwa/desktop-home.png",fullPage:false});
  const sourceUrl=await page.evaluate(()=>{
    const url=new URL("./player.html?channel=gb-sky-news&name=Sky",location.href);
    return url.href;
  });
  assert.ok(!new URL(sourceUrl).searchParams.has("source"),"Public player URL must never include a stream URL");
  assert.deepEqual(errors,[],"Browser must have no uncaught JS errors");
  console.log(JSON.stringify({passed:true,countries,gbResults,screenshots:3}));
} finally {
  await browser.close();
}
