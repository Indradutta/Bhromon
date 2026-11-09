import puppeteer from 'puppeteer-core';

async function test() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 800, height: 1100 });
  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { margin: 0; background: #333; display: flex; gap: 20px; padding: 20px; }
        .box1 {
          width: 250px;
          height: 1024px;
          background-color: #DCEFFC;
          background-image: url('file:///C:/WORK/internship/project4/BHROMON/public/images/sidebar/sidebar.png');
          background-repeat: no-repeat;
          background-position: center bottom;
          background-size: 100% 100%;
          border: 1px solid red;
        }
        .box2 {
          width: 250px;
          height: 1024px;
          background-color: #DCEFFC;
          background-image: url('file:///C:/WORK/internship/project4/BHROMON/public/images/sidebar/sidebar.png');
          background-repeat: no-repeat;
          background-position: center bottom;
          background-size: 100% auto;
          border: 1px solid green;
        }
        .box3 {
          width: 250px;
          height: 1024px;
          background-color: #DCEFFC;
          background-image: url('file:///C:/WORK/internship/project4/BHROMON/public/images/sidebar/sidebar.png');
          background-repeat: no-repeat;
          background-position: center bottom;
          background-size: cover;
          border: 1px solid blue;
        }
      </style>
    </head>
    <body>
      <div class="box1"></div>
      <div class="box2"></div>
      <div class="box3"></div>
    </body>
    </html>
  `);
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: 'scripts/sidebar-compare.png' });
  await browser.close();
  console.log('Saved scripts/sidebar-compare.png');
}

test().catch(console.error);
