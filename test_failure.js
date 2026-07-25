const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', error => errors.push(error.message));
  
  try {
    await page.goto('http://localhost:8080/index.html', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    // Generate level
    await page.click('#nextLevelBtn');
    await page.waitForTimeout(2000);
    
    // Get ball and goal positions
    const ballPos = await page.textContent('#ballPos');
    const goalPos = await page.textContent('#goalPos');
    console.log('Ball:', ballPos);
    console.log('Goal:', goalPos);
    
    // Enter WRONG function (limit doesn't match goal)
    await page.fill('#functionInput', '(x-2)*(x+5)/(x-2)'); // limit would be ~7, not goal
    await page.click('#testBtn');
    await page.waitForTimeout(1500);
    
    const testStatus = await page.textContent('#statusMessage');
    console.log('Test status (wrong):', testStatus);
    
    // Launch should fail
    await page.click('#launchBtn');
    await page.waitForTimeout(2000);
    
    const failStatus = await page.textContent('#statusMessage');
    console.log('Fail status:', failStatus);
    
    // Now try correct function
    await page.waitForTimeout(2000);
    await page.fill('#functionInput', '3.002*(x^2 - 4.2436)/(x - 2.06)'); // scale for goal
    await page.click('#testBtn');
    await page.waitForTimeout(1500);
    
    const testStatus2 = await page.textContent('#statusMessage');
    console.log('Test status (correct):', testStatus2);
    
    await page.click('#launchBtn');
    await page.waitForTimeout(5000);
    
    const successStatus = await page.textContent('#statusMessage');
    console.log('Success status:', successStatus);
    
  } catch (e) {
    console.log('Error:', e.message);
  }
  
  await browser.close();
  
  if (errors.length > 0) {
    console.log('\nJavaScript Errors:', errors);
    process.exit(1);
  } else {
    console.log('\nNo JavaScript errors!');
    process.exit(0);
  }
})();
