// Utility: Wait for element to appear in DOM
function waitForElement(selector, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const el = document.querySelector(selector);
      if (el) {
        clearInterval(interval);
        resolve(el);
      } else if (Date.now() - startTime > timeout) {
        clearInterval(interval);
        reject(new Error(`Timeout: ${selector} not found`));
      }
    }, 100);
  });
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === 'START_WORKFLOW') {
    const { tsfnCode } = request;
    console.log('[TSFN Extension] Starting workflow with code:', tsfnCode);

    try {
      // Step 2: Inject code and try multiple submission methods
      const inputField = await waitForElement('#idBarcodeSearchInput', 15000);
      inputField.value = tsfnCode;
      inputField.dispatchEvent(new Event('input', { bubbles: true }));

      // Try submitting the form if input is inside a form
      if (inputField.form) {
        inputField.form.submit();
        console.log('[TSFN Extension] Form submitted.');
      } else {
        // Try triggering Enter key events
        inputField.focus();
        const enterEvent = new KeyboardEvent('keydown', { 
          bubbles: true, 
          cancelable: true, 
          key: 'Enter', 
          code: 'Enter', 
          keyCode: 13 
        });
        inputField.dispatchEvent(enterEvent);

        // Also try triggering 'change' event
        inputField.dispatchEvent(new Event('change', { bubbles: true }));

        console.log('[TSFN Extension] Enter key and change event dispatched.');
      }
    } catch (err) {
      console.error('[TSFN Extension] Step 2 failed:', err);
      alert('Failed to inject TSFN code. Is the input field present?');
    }
  }
});