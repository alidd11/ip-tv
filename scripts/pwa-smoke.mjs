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
  const countries=await page.locator("#directoryCountry option").count();
  assert.ok(countries>=200,"global country selection needs 200+ countries");
  const gbResults=await page.locator("#directoryResults .directory-card").count();
  assert.ok(gbResults>0,"UK results expected");

  await page.screenshot({path:"artifacts/pwa/iphone-home.png",fullPage:true});
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
  await page.locator("[data-close-sheet]").last().click();
  await page.screenshot({path:"artifacts/pwa/iphone-turkey-search.png",fullPage:true});

  const desktop=await browser.newPage({viewport:{width:1440,height:900}});
  await desktop.goto(base,{waitUntil:"networkidle"});
  await desktop.waitForFunction(()=>document.querySelector("#directoryStatus")?.textContent?.includes("channel"));
  await desktop.screenshot({path:"artifacts/pwa/desktop-home.png",fullPage:true});
  assert.deepEqual(errors,[],"Browser must have no uncaught JS errors");
  console.log(JSON.stringify({passed:true,countries,gbResults,screenshots:3}));
} finally {
  await browser.close();
}
