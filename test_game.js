const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', error => errors.push(error.message));
  
  try {
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.goto('http://localhost:8080/index.html', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    // Check if Desmos loaded
    const calcExists = await page.evaluate(() => typeof window.calculator !== 'undefined');
    console.log('Calculator initialized:', calcExists);
    
    // Click Next Level
    await page.click('#nextBtn');
    await page.waitForTimeout(1500);
    
    // Get level info
    const levelBadge = await page.textContent('#levelBadge');
    const goalDisplay = await page.textContent('#goalDisplay');
    console.log('Level:', levelBadge);
    console.log('Goal:', goalDisplay);
    
    // Check canvas
    const canvasRect = await page.evaluate(() => {
      const c = document.getElementById('gameCanvas');
      return { width: c.width, height: c.height, styleWidth: c.style.width, styleHeight: c.style.height };
    });
    console.log('Canvas:', canvasRect);
    
    // Check status
    const status = await page.textContent('#statusBar');
    console.log('Status:', status);
    
    // Test function input
    await page.fill('#functionInput', '(x-2)*(x+2)/(x-2)');
    await page.click('#validateBtn');
    await page.waitForTimeout(1500);
    
    const status2 = await page.textContent('#statusBar');
    console.log('After validate:', status2);
    
    const display = await page.textContent('#functionDisplay');
    console.log('Function display:', display);
    
    // Try start
    const startDisabled = await page.isDisabled('#startBtn');
    console.log('Start disabled:', startDisabled);
    
    if (!startDisabled) {
      await page.click('#startBtn');
      await page.waitForTimeout(7000);
      
      const finalStatus = await page.textContent('#statusBar');
      console.log('Final status:', finalStatus);
      
      const timer = await page.textContent('#timerDisplay');
      console.log('Timer:', timer);
    }
    
  } catch (e) { console.log('Error:', e.message); }
  
  await browser.close();
  
  if (errors.length > 0) { 
    console.log('\nJavaScript Errors:', errors); 
    process.exit(1); 
  } else { 
    console.log('\nNo JavaScript errors!'); 
    process.exit(0); 
  }
})();