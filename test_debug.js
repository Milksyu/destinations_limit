const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1400, height: 900 });
  
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', error => errors.push(error.message));
  
  try {
    await page.goto('http://localhost:8080/index.html', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    // Level 1
    await page.click('#nextBtn');
    await page.waitForTimeout(1000);
    
    await page.fill('#functionInput', '(x-2)*(x+2)/(x-2)');
    await page.click('#validateBtn');
    await page.waitForTimeout(1000);
    
    await page.click('#startBtn');
    
    // Monitor game state for 15 seconds
    for (let i = 0; i < 30; i++) {
      await page.waitForTimeout(500);
      const status = await page.textContent('#statusBar');
      const timer = await page.textContent('#timerDisplay');
      const animating = await page.evaluate(() => window.isAnimating);
      const ballPos = await page.evaluate(() => ({ x: window.ball?.x, y: window.ball?.y }));
      const pathLen = await page.evaluate(() => window.pathPoints?.length);
      console.log(`t=${(i+1)*0.5}s: status="${status.trim()}" timer="${timer}" animating=${animating} ball=(${ballPos.x?.toFixed(2)}, ${ballPos.y?.toFixed(2)}) pathPts=${pathLen}`);
      
      if (status.includes('Complete') || status.includes('Time up') || status.includes('did not reach')) {
        console.log('Game ended!');
        break;
      }
    }
    
    const finalLevel = await page.textContent('#levelBadge');
    console.log('Final level:', finalLevel);
    
  } catch (e) { console.log('Error:', e.message); }
  
  await browser.close();
  if (errors.length > 0) { console.log('\nErrors:', errors); process.exit(1); }
  else { console.log('\nNo JS errors!'); process.exit(0); }
})();