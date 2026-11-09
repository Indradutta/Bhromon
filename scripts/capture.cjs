const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

async function main() {
  const chromeProcess = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--window-size=1440,3200',
    'http://localhost:5174/'
  ]);

  await new Promise(r => setTimeout(r, 2500));

  http.get('http://127.0.0.1:9222/json', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', async () => {
      try {
        const pages = JSON.parse(data);
        const wsUrl = pages[0]?.webSocketDebuggerUrl;
        if (!wsUrl) {
          console.error('No wsUrl found');
          chromeProcess.kill();
          return;
        }

        const ws = new WebSocket(wsUrl);
        let id = 1;
        const send = (method, params = {}) => {
          return new Promise((resolve) => {
            const curId = id++;
            const handler = (event) => {
              const msg = JSON.parse(event.data);
              if (msg.id === curId) {
                ws.removeEventListener('message', handler);
                resolve(msg.result);
              }
            };
            ws.addEventListener('message', handler);
            ws.send(JSON.stringify({ id: curId, method, params }));
          });
        };

        ws.onopen = async () => {
          console.log('Connected to CDP');
          await send('Page.enable');
          await send('Runtime.enable');
          await send('DOM.enable');

          // wait 3 seconds for animations and rendering
          await new Promise(r => setTimeout(r, 3000));

          // Capture Top/Hero
          const res1 = await send('Page.captureScreenshot', { format: 'png' });
          if (res1 && res1.data) {
            fs.writeFileSync(path.join(__dirname, 'hero_view.png'), Buffer.from(res1.data, 'base64'));
            console.log('Saved hero_view.png');
          }

          // Scroll to Blog / Journal
          await send('Runtime.evaluate', {
            expression: `
              const el = document.getElementById('journal-preview');
              if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
            `
          });
          await new Promise(r => setTimeout(r, 2500));

          const res2 = await send('Page.captureScreenshot', { format: 'png' });
          if (res2 && res2.data) {
            fs.writeFileSync(path.join(__dirname, 'blog_scrapbook_view.png'), Buffer.from(res2.data, 'base64'));
            console.log('Saved blog_scrapbook_view.png');
          }

          // Scroll to Travel Gallery
          await send('Runtime.evaluate', {
            expression: `
              const el = document.getElementById('gallery');
              if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
            `
          });
          await new Promise(r => setTimeout(r, 1500));

          const res3 = await send('Page.captureScreenshot', { format: 'png' });
          if (res3 && res3.data) {
            fs.writeFileSync(path.join(__dirname, 'gallery_view.png'), Buffer.from(res3.data, 'base64'));
            console.log('Saved gallery_view.png');
          }

          ws.close();
          chromeProcess.kill();
          process.exit(0);
        };
      } catch (e) {
        console.error('Error:', e);
        chromeProcess.kill();
        process.exit(1);
      }
    });
  }).on('error', (err) => {
    console.error('HTTP error:', err.message);
    chromeProcess.kill();
    process.exit(1);
  });
}

main();
