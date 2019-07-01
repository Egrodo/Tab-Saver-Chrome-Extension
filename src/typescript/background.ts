import { GlobalState, BtnHandlerState, Storage, RequestType, ResponseData } from '../types';
import { debounce } from './helpers';

// On button click, check if there are savedTabs.
//  If yes, open them
//  If no, check if there are open tabs besides newtab
//    If yes, save them, close them, open preview page.
//    If no, ignore

const GlobalState: GlobalState = {
  tabs: [],
};

class BtnHandler {
  localState: BtnHandlerState = {
    previewTabId: null,
  };

  saveAndCloseTabs = (tabs: chrome.tabs.Tab[]): void => {
    // Filter out un-savable tabs
    const savableTabs = tabs.filter(tab => (tab.url && tab.title && !tab.incognito ? true : false));

    if (savableTabs.length) {
      console.log(`Saving ${savableTabs.length} tabs.`);
      chrome.storage.local.set({ savedTabs: savableTabs });
      GlobalState.tabs = savableTabs;

      // Open / highlight preview window before closing savableTabs.
      this.openPreviewWindow();
      this.closeAllTabs(savableTabs.map(tab => tab.id));
    } else {
      console.log('No tabs to save, doing nothing.');
    }
  };

  openPreviewWindow = (): void => {
    chrome.tabs.create(
      { url: chrome.runtime.getURL('preview.html'), active: true },
      ({ id }) => (this.localState.previewTabId = id),
    );
  };

  closePreviewWindow = (): void => {
    if (this.localState.previewTabId) {
      chrome.tabs.remove(this.localState.previewTabId);
      this.localState.previewTabId = null;
    }
  };

  closeAllTabs = (ids: number[]): void => {
    console.log(`Closing ${ids.length} tabs.`);
    chrome.tabs.remove(ids);
  };

  restoreAllTabs = (tabs: chrome.tabs.Tab[]): void => {
    console.log(`Restoring ${tabs.length} tabs.`);
    try {
      tabs.forEach(({ url, active }) => chrome.tabs.create({ url, active }));

      // If successfully restored (without throwing error) remove from storage
      chrome.storage.local.set({ savedTabs: [] });
      GlobalState.tabs = [];
    } catch (error) {
      console.error(error);
    }
  };

  handleBtnClick = (): void => {
    chrome.storage.local.get(['savedTabs'], (storage: Storage) => {
      // If there are tabs saved, restore them. Otherwise save and close the current tabs.
      if (storage.savedTabs && storage.savedTabs.length) {
        this.restoreAllTabs(storage.savedTabs);
        this.closePreviewWindow();
      } else {
        chrome.tabs.query({ currentWindow: true }, this.saveAndCloseTabs);
      }
    });
  };
}

class MessageHandler {
  tabId: number | null = null;

  sendResponse = (data: ResponseData): void => {
    chrome.tabs.sendMessage(this.tabId, data);
  };

  onMessage = ({ type }: RequestType, sender: chrome.runtime.MessageSender): void => {
    this.tabId = sender.tab.id;
    switch (type) {
      case 'getTabs':
        if (!GlobalState.tabs.length) {
          console.error('Tabs requested but none in global state?');
          this.sendResponse({ status: 'failure', data: [] });
          return;
        }

        this.sendResponse({ status: 'success', data: GlobalState.tabs });
        break;
      default:
        console.error(`Invalid request type sent to background script: ${type}`);
    }
  };
}

const MessageHandlerRef = new MessageHandler();
chrome.runtime.onMessage.addListener(MessageHandlerRef.onMessage);

const BtnHandlerRef = new BtnHandler();
const debouncedClickHandler = debounce(200, BtnHandlerRef.handleBtnClick);
chrome.browserAction.onClicked.addListener(debouncedClickHandler);
