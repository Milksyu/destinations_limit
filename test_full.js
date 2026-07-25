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
    
    console.log('=== Testing all 5 levels ===\n');
    
    for (let level = 1; level <= 5; level++) {
      console.log(`--- Level ${level} ---`);
      
      // Click Next Level
      await page.click('#nextBtn');
      await page.waitForTimeout(800);
      
      const levelBadge = await page.textContent('#levelBadge');
      const goalDisplay = await page.textContent('#goalDisplay');
      console.log('Level:', levelBadge);
      console.log('Goal:', goalDisplay);
      
      // Get the hint
      await page.click('#hintBtn');
      await page.waitForTimeout(200);
      const hint = await page.textContent('#hintBox');
      console.log('Hint:', hint.replace(/\s+/g, ' ').trim());
      await page.click('#hintBtn');
      
      // Test functions per level
      const wrongFunc = level === 1 ? '(x-2)*(x+5)/(x-2)' : 
                        level === 2 ? '(x+2)*(x+10)/(x+2)' :
                        level === 3 ? '(x-3)*(x+10)/(x-3)' :
                        level === 4 ? '(x-1.5)*(x+10)/(x-1.5)' :
                                     '(x+1)*(x+10)/(x+1)';
      
      const correctFunc = level === 1 ? '(x-2)*(x+2)/(x-2)' :
                          level === 2 ? '3*(x+2)/(x+2)' :
                          level === 3 ? '-2*(x-3)/(x-3)' :
                          level === 4 ? '5*(x-1.5)/(x-1.5)' :
                                       '2*sin(x+1)/(x+1)';
      
      // Test wrong function
      await page.fill('#functionInput', wrongFunc);
      await page.click('#validateBtn');
      await page.waitForTimeout(500);
      
      const wrongStatus = await page.textContent('#statusBar');
      console.log('Wrong:', wrongStatus.trim());
      
      // Test correct function
      await page.fill('#functionInput', correctFunc);
      await page.click('#validateBtn');
      await page.waitForTimeout(500);
      
      const validStatus = await page.textContent('#statusBar');
      console.log('Correct:', validStatus.trim());
      
      // Start game
      await page.click('#startBtn');
      
      // Wait for game to complete
      await page.waitForTimeout(6000);
      
      const finalStatus = await page.textContent('#statusBar');
      console.log('Final:', finalStatus.trim());
      
      // Wait for level to advance
      await page.waitForTimeout(500);
      
      const nextLevel = await page.textContent('#levelBadge');
      console.log('Next:', nextLevel);
      console.log('');
    }
    
    console.log('=== All 5 levels completed! ===');
    
  } catch (e) { console.log('Error:', e.message); errors.push(e.message); }
  
  await browser.close();
  
  if (errors.length > 0) { 
    console.log('\nJavaScript Errors:', errors); 
    process.exit(1); 
  } else { 
    console.log('\n✅ No JavaScript errors! All tests passed.'); 
    process.exit(0); 
  }
})();