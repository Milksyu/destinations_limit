const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', error => errors.push(error.message));
  
  try {
    await page.goto('http://localhost:8080/index.html', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    await page.click('#nextBtn');
    await page.waitForTimeout(2000);
    
    // Click quadratic template
    await page.click('button:has-text("Quadratic")');
    await page.waitForTimeout(1500);
    
    const testStatus = await page.textContent('#statusMessage');
    console.log('Test (quadratic template):', testStatus);
    
    const dropDisabled = await page.isDisabled('#dropBtn');
    console.log('Drop disabled:', dropDisabled);
    
    if (!dropDisabled) {
      await page.click('#dropBtn');
      await page.waitForTimeout(6000);
      const final = await page.textContent('#statusMessage');
      console.log('Final:', final);
    }
    
    // Test another level
    await page.waitForTimeout(1000);
    await page.click('#nextBtn');
    await page.waitForTimeout(2000);
    
    const goal2 = await page.textContent('#goalPos');
    console.log('Level 2 Goal:', goal2);
    
    await page.click('button:has-text("Trig")');
    await page.waitForTimeout(1500);
    const test2 = await page.textContent('#statusMessage');
    console.log('Test 2 (trig):', test2);
    
  } catch (e) { console.log('Error:', e.message); }
  
  await browser.close();
  
  if (errors.length > 0) { console.log('\nErrors:', errors); process.exit(1); }
  else { console.log('\nNo JS errors!'); process.exit(0); }
})();
