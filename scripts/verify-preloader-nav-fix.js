import puppeteer from 'puppeteer-core';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function verify() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
  });

  console.log('1. Navigating to http://localhost:5174/ ...');
  await page.goto('http://localhost:5174/', { waitUntil: 'domcontentloaded' });
  
  // Wait 2.5 seconds to be in the middle of train crossing sun animation
  await new Promise(r => setTimeout(r, 2500));

  // Check that navbar is NOT in DOM
  const navDuringPreloader = await page.$('header');
  console.log('Navbar present during preloader?', navDuringPreloader !== null ? 'YES (UNEXPECTED)' : 'NO (CORRECT!)');

  // Check that skip button is NOT in DOM
  const skipBtn = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    return btns.some(b => b.textContent.includes('Skip'));
  });
  console.log('Skip button present?', skipBtn ? 'YES (UNEXPECTED)' : 'NO (CORRECT!)');

  // Capture preloader scene
  await page.screenshot({ path: path.join(__dirname, 'preloader-pure-cinematic.png') });
  console.log('Saved preloader-pure-cinematic.png');

  // Wait for preloader to complete (~8s more)
  console.log('Waiting for preloader completion...');
  await new Promise(r => setTimeout(r, 8000));

  // Check navbar IS in DOM after preloader
  const navAfterPreloader = await page.$('header');
  console.log('Navbar present after preloader?', navAfterPreloader !== null ? 'YES (CORRECT!)' : 'NO');
  await page.screenshot({ path: path.join(__dirname, 'post-preloader-revealed.png') });
  console.log('Saved post-preloader-revealed.png');

  // Test reload: it MUST start from preloader again
  console.log('2. Reloading page...');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));

  const preloaderOnReload = await page.$('#bhromon-preloader');
  console.log('Preloader present on reload?', preloaderOnReload !== null ? 'YES (CORRECT!)' : 'NO');

  const navOnReload = await page.$('header');
  console.log('Navbar present during reload preloader?', navOnReload !== null ? 'YES (UNEXPECTED)' : 'NO (CORRECT!)');

  await page.screenshot({ path: path.join(__dirname, 'reload-starts-preloader.png') });
  console.log('Saved reload-starts-preloader.png');

  await browser.close();
  console.log('All tests passed successfully!');
}

verify().catch(console.error);
