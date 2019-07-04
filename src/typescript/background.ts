import { GlobalState, BtnHandlerState, Storage, RequestType, ResponseData } from '../types';
import { debounce } from './helpers';

// On button click, check if there are savedTabs.
//  If yes, open them
//  If no, check if there are open tabs besides newtab
//    If yes, save them, close them, open preview page.
//    If no, ignore

const GlobalState: GlobalState = { tabs: [] };

// On change of
Object.defineProperty(GlobalState, 'tabs', {
  set(tabs) {
    this.value = tabs;

    BtnHandler.updateBadge(tabs);
  },
  get() {
    return this.value;
  },
});

class BtnHandler {
  public localState: BtnHandlerState = {
    previewTabId: null,
  };

  public static updateBadge(tabs: chrome.tabs.Tab[]) {
    // On update of value, if there are tabs, set the tooltip to a preview of the domains.
    if (tabs.length > 0) {
      const domains: string[] = tabs.map(tab => tab.url.split('//')[1].split('/')[0]);
      let domainDisplay: string = `${tabs.length} tabs currently saved:\n`;
      // Display the first 5 domains in the tooltip.
      for (let i = 0; i < (domains.length > 5 ? 5 : domains.length); ++i) {
        // If we're on the last one, don't display the comma.
        domainDisplay += i === (domains.length > 5 ? 4 : domains.length - 1) ? `${domains[i]}\n` : `${domains[i]},\n`;
      }
      if (domains.length > 5) domainDisplay += `and ${domains.length - 5} more.`;

      chrome.browserAction.setBadgeText({ text: tabs.length.toString() });
      chrome.browserAction.setTitle({ title: domainDisplay });
    } else {
      chrome.browserAction.setBadgeText({ text: '' });
      chrome.browserAction.setTitle({ title: `Click me to save your tabs!` });
    }
  }

  saveAndCloseTabs = (tabs: chrome.tabs.Tab[]): void => {
    // Filter out un-savable tabs
    const savableTabs = tabs.filter(tab => (tab.url && tab.title && !tab.incognito ? true : false));

    if (savableTabs.length) {
      console.log(`Saving ${savableTabs.length} tabs.`);
      chrome.storage.local.set({ savedTabs: savableTabs });

      // Updating this value also updates the badge.
      GlobalState.tabs = savableTabs;

      // Open / highlight preview window before closing savableTabs.
      this.openPreviewWindow();
      this.closeAllTabs(savableTabs.map(tab => tab.id));
    } else {
      console.log('No tabs to save, doing nothing.');
    }
  };

  public openPreviewWindow = (): void => {
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

// On startup, check for tabs in storage. If there are any, update state and open window.
chrome.storage.local.get(['savedTabs'], (storage: Storage) => {
  if (storage.savedTabs && storage.savedTabs.length) {
    GlobalState.tabs = storage.savedTabs;
    BtnHandlerRef.openPreviewWindow();
  }
});

const debouncedClickHandler = debounce(200, BtnHandlerRef.handleBtnClick);
chrome.browserAction.onClicked.addListener(debouncedClickHandler);
