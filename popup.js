const input = document.getElementById('tsfnInput');
const goBtn = document.getElementById('goBtn');
const errorMsg = document.getElementById('errorMsg');

input.addEventListener('input', () => {
  const value = input.value.trim();
  const isValid = value.startsWith('TSFN') && value.length >= 6;
  goBtn.disabled = !isValid;
  errorMsg.textContent = isValid ? '' : 'must start with "TSFN" and be at least 6 characters.';
});

goBtn.addEventListener('click', async () => {
  const tsfnCode = input.value.trim();
  try {
    // Send message to active tab's content script
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) {
      errorMsg.textContent = 'No active tab found.';
      return;
    }

    chrome.tabs.sendMessage(tab.id, { action: 'START_WORKFLOW', tsfnCode });
    window.close(); // Close popup after sending
  } catch (err) {
    console.error('Popup: Failed to send message', err);
    errorMsg.textContent = 'Error starting workflow.';
  }
});