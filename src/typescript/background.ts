import { State, Storage } from '../types';
import { debounce } from './helpers';

// On button click, check if there are savedTabs.
//  If yes, open them
//  If no, check if there are open tabs besides newtab
//    If yes, save them, close them, open preview page.
//    If no, ignore

const State: State = {
  previewTabId: null,
};

function saveTabs(tabs: chrome.tabs.Tab[]): void {
  // Filter out un-savable tabs
  const savableTabs = tabs.filter(tab => (tab.url && tab.title && !tab.incognito ? true : false));

  if (savableTabs.length) {
    console.log(`Saving ${savableTabs.length} tabs.`);
    chrome.storage.local.set({ savedTabs: savableTabs });

    // Open / highlight preview window before closing savableTabs.
    handlePreviewWindow({ action: 'open' });
    closeTabs(savableTabs.map(tab => tab.id));
  } else {
    console.log('No tabs to save.');
  }
}

function handlePreviewWindow({ action }): void {
  switch (action) {
    case 'open':
      chrome.tabs.create(
        { url: chrome.runtime.getURL('preview.html'), active: true },
        ({ id }) => (State.previewTabId = id),
      );
    case 'close':
      if (State.previewTabId) {
        chrome.tabs.remove(State.previewTabId);
      }
  }
}

function closeTabs(ids: number[]): void {
  console.log(`Closing ${ids.length} tabs`);
  chrome.tabs.remove(ids);
}

function restoreTabs(tabs: chrome.tabs.Tab[]): void {
  try {
    console.log(`Restoring ${tabs.length} tabs.`);
    tabs.forEach(({ url, active }) => chrome.tabs.create({ url, active }));

    // Remove them after successful restoring.
    chrome.storage.local.set({ savedTabs: [] });
  } catch (err) {
    // If failed to restore, don't remove them from the storage.
    console.error(err);
  }
}

function onBtnClick(): void {
  chrome.storage.local.get(['savedTabs'], (storage: Storage) => {
    // If there are savedTabs, restore them. Otherwise save current tabs.
    if (storage.savedTabs && storage.savedTabs.length) {
      restoreTabs(storage.savedTabs);
      handlePreviewWindow({ action: 'close' });
    } else {
      chrome.tabs.query({ currentWindow: true }, saveTabs);
    }
  });
}

chrome.browserAction.onClicked.addListener(onBtnClick);
