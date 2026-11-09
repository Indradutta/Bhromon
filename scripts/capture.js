const { spawn } = require('child_process');
const http = require('http');

async function main() {
  const chromeProcess = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--window-size=1440,3200',
    'http://localhost:5174/'
  ]);

  console.log('Launched Chrome...');
  await new Promise(r => setTimeout(r, 2000));

  http.get('http://127.0.0.1:9222/json', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', async () => {
      try {
        const pages = JSON.parse(data);
        console.log('Pages found:', pages.length);
        const wsUrl = pages[0]?.webSocketDebuggerUrl;
        console.log('wsUrl:', wsUrl);
        chromeProcess.kill();
      } catch (e) {
        console.error('Error:', e);
        chromeProcess.kill();
      }
    });
  }).on('error', (err) => {
    console.error('HTTP error:', err.message);
    chromeProcess.kill();
  });
}

main();
