// On button click, check if there are savedTabs.
//  If yes, open them
//  If no, check if there are open tabs besides newtab
//    If yes, save them, close them, open preview page.
//    If no, ignore

function saveTabs(tabs: chrome.tabs.Tab[]): void {
  // Filter out un-savable tabs
  const savableTabs = tabs.filter(tab => (tab.url && tab.title && !tab.incognito ? true : false));

  if (savableTabs.length) {
    console.log(`Saving ${savableTabs.length} tabs.`);
    chrome.storage.local.set({ savedTabs: savableTabs });

    openPreview();
    closeTabs(savableTabs.map(tab => tab.id));
  } else {
    console.log('No tabs to save.');
  }
}

function openPreview() {
  console.log('Opening preview tab');

  chrome.tabs.create({ url: 'https://www.google.com', active: true });
}

function closeTabs(ids) {
  console.log(`Closing ${ids.length} tabs`);

  chrome.tabs.remove(ids);
}

function restoreTabs(tabs) {
  console.log(`Restoring ${tabs.length} tabs.`);

  try {
    tabs.forEach(({ url, active }) => chrome.tabs.create({ url, active }));

    // Remove them after successful restoring.
    chrome.storage.local.set({ savedTabs: [] });
  } catch (err) {
    // If failed to restore, don't remove them from the storage.
    console.error(err);
  }
}

function onBtnClick() {
  chrome.storage.local.get(['savedTabs'], storage => {
    if (storage.savedTabs && storage.savedTabs.length) {
      restoreTabs(storage.savedTabs);
    } else {
      chrome.tabs.query({ currentWindow: true }, saveTabs);
    }
  });
}

chrome.browserAction.onClicked.addListener(onBtnClick);
