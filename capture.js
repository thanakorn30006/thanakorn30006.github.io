const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--window-size=1440,900',
    '--hide-scrollbars',
    'http://localhost:8000/'
  ]);

  console.log('[*] Launched Chrome headless on port 9222');
  await sleep(2500);

  let targets;
  try {
    const res = await fetch('http://127.0.0.1:9222/json');
    targets = await res.json();
  } catch (err) {
    console.error('Failed to connect to Chrome debug port:', err);
    chromeProc.kill();
    return;
  }

  const pageTarget = targets.find((t) => t.type === 'page');
  if (!pageTarget || !pageTarget.webSocketDebuggerUrl) {
    console.error('No page target found');
    chromeProc.kill();
    return;
  }

  console.log('[*] Connecting to WebSocket:', pageTarget.webSocketDebuggerUrl);
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

  let msgId = 1;
  const callbacks = new Map();

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && callbacks.has(data.id)) {
      callbacks.get(data.id)(data);
      callbacks.delete(data.id);
    }
  };

  function sendCommand(method, params = {}) {
    return new Promise((resolve) => {
      const id = msgId++;
      callbacks.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await new Promise((resolve) => (ws.onopen = resolve));
  console.log('[*] Connected to Chrome DevTools Protocol!');

  // Enable Page & Runtime
  await sendCommand('Page.enable');
  await sendCommand('Runtime.enable');
  await sleep(1500);

  async function takeScreenshot(filename) {
    const res = await sendCommand('Page.captureScreenshot', { format: 'png' });
    if (res.result && res.result.data) {
      const buffer = Buffer.from(res.result.data, 'base64');
      const outPath = path.join('/Users/thanakorn/Desktop/shadowcat-website', filename);
      fs.writeFileSync(outPath, buffer);
      console.log(`[+] Captured: ${filename} (${buffer.length} bytes)`);
    } else {
      console.error(`[-] Failed to capture: ${filename}`, res);
    }
  }

  // 1. Forensics Screenshot
  await takeScreenshot('screenshot-forensics.png');

  // 2. Payloads & RevShells
  await sendCommand('Runtime.evaluate', {
    expression: `(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const b = btns.find(x => x.textContent.includes('Payloads'));
      if (b) b.click();
    })()`
  });
  await sleep(1000);
  await takeScreenshot('screenshot-payloads.png');

  // 3. Cryptanalysis & Decoder
  await sendCommand('Runtime.evaluate', {
    expression: `(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const b = btns.find(x => x.textContent.includes('Cryptanalysis'));
      if (b) b.click();
    })()`
  });
  await sleep(1000);
  await takeScreenshot('screenshot-crypto.png');

  // 4. Web Vulnerabilities
  await sendCommand('Runtime.evaluate', {
    expression: `(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const b = btns.find(x => x.textContent.includes('Web Vulnerabilities'));
      if (b) b.click();
    })()`
  });
  await sleep(1000);
  await takeScreenshot('screenshot-web.png');

  ws.close();
  chromeProc.kill();
  console.log('[*] Done capturing all real screenshots!');
}

main().catch(console.error);
