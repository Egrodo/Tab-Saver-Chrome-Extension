import { browser } from 'webextension-polyfill';

import {
  GlobalState,
  BtnHandlerState,
  Storage,
  RequestPackage,
  ResponseData,
} from '../types';
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
    browser.storage.local.set({ savedTabs: tabs });
    BtnHandler.updateBadge(tabs);
  },
  get() {
    return this.value;
  },
});

class BtnHandler {
  private localState: BtnHandlerState = {
    previewTabId: null,
  };

  public static updateBadge(tabs: browser.tabs.Tab[]) {
    // On update of value, if there are tabs, set the tooltip to a preview of the domains.
    if (tabs.length > 0) {
      const domains: string[] = tabs.map(
        (tab) => tab.url.split('//')[1].split('/')[0]
      );
      let domainDisplay: string = `${tabs.length} tabs currently saved:\n`;
      // Display the first 5 domains in the tooltip.
      for (let i = 0; i < (domains.length > 5 ? 5 : domains.length); ++i) {
        // If we're on the last one, don't display the comma.
        domainDisplay +=
          i === (domains.length > 5 ? 4 : domains.length - 1)
            ? `${domains[i]}\n`
            : `${domains[i]},\n`;
      }
      if (domains.length > 5)
        domainDisplay += `and ${domains.length - 5} more.`;

      browser.browserAction.setBadgeText({ text: tabs.length.toString() });
      browser.browserAction.setTitle({ title: domainDisplay });
    } else {
      browser.browserAction.setBadgeText({ text: '' });
      browser.browserAction.setTitle({ title: `Click me to save your tabs!` });
    }
  }

  saveAndCloseTabs = (tabs: browser.tabs.Tab[]): void => {
    // Filter out un-savable tabs
    const savableTabs = tabs.filter((tab) =>
      tab.url && tab.title && !tab.incognito ? true : false
    );

    if (savableTabs.length) {
      console.log(`Saving ${savableTabs.length} tabs.`);

      // Updating this value also updates the badge.
      GlobalState.tabs = savableTabs;

      // Open / highlight preview window before closing savableTabs.
      this.openPreviewWindow();
      this.closeAllTabs(savableTabs.map((tab) => tab.id));
    } else {
      console.log('No tabs to save, doing nothing.');
    }
  };

  public openPreviewWindow = (): void => {
    browser.tabs.create(
      { url: browser.runtime.getURL('preview.html'), active: true },
      ({ id }) => (this.localState.previewTabId = id)
    );
  };

  closePreviewWindow = (): void => {
    if (this.localState.previewTabId) {
      browser.tabs.remove(this.localState.previewTabId);
      this.localState.previewTabId = null;
    }
  };

  closeAllTabs = (ids: number[]): void => {
    console.log(`Closing ${ids.length} tabs.`);
    browser.tabs.remove(ids);
  };

  restoreAllTabs = (tabs: browser.tabs.Tab[]): void => {
    console.log(`Restoring ${tabs.length} tabs.`);
    try {
      tabs.forEach(({ url, active }) => browser.tabs.create({ url, active }));

      // If successfully restored (without throwing error) remove from storage
      GlobalState.tabs = [];
    } catch (error) {
      console.error(error);
    }
  };

  handleBtnClick = (): void => {
    browser.storage.local.get(['savedTabs'], (storage: Storage) => {
      // If there are tabs saved, restore them. Otherwise save and close the current tabs.
      if (storage.savedTabs && storage.savedTabs.length) {
        this.restoreAllTabs(storage.savedTabs);
        this.closePreviewWindow();
      } else {
        browser.tabs.query({ currentWindow: true }, this.saveAndCloseTabs);
      }
    });
  };
}

class MessageHandler {
  tabId: number | null = null;

  sendResponse = (data: ResponseData): void => {
    browser.tabs.sendMessage(this.tabId, data);
  };

  onMessage = (
    { type, data }: RequestPackage,
    sender: browser.runtime.MessageSender
  ): void => {
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
      case 'removeTab':
        if (data === undefined) {
          console.error(
            'Tab removal request recieved but no tab included to remove'
          );
          this.sendResponse({ status: 'failure', data: [] });
          return;
        }
        console.log(`Removing tab index ${data}.`);
        const newTabs: browser.tabs.Tab[] = GlobalState.tabs.filter(
          ({ id }) => id !== Number.parseInt(data)
        );
        GlobalState.tabs = newTabs;

        this.sendResponse({ status: 'success', data: GlobalState.tabs });
        break;
      default:
        console.error(
          `Invalid request type sent to background script: ${type}`
        );
    }
  };
}

const MessageHandlerRef = new MessageHandler();
browser.runtime.onMessage.addListener(MessageHandlerRef.onMessage);

const BtnHandlerRef = new BtnHandler();

// On startup, check for tabs in storage. If there are any, update state and open window.
browser.storage.local.get(['savedTabs'], (storage: Storage) => {
  if (storage.savedTabs && storage.savedTabs.length) {
    GlobalState.tabs = storage.savedTabs;
    BtnHandlerRef.openPreviewWindow();
  }
});

// On startup, create context menu on right clicking the badge for saved tab removal
browser.contextMenus.create({
  title: 'Remove all saved tabs',
  contexts: ['browser_action'],
  onclick: () => {
    GlobalState.tabs = [];
    this.sendResponse({ status: 'success', data: GlobalState.tabs });
  },
});

const debouncedClickHandler = debounce(200, BtnHandlerRef.handleBtnClick);
browser.browserAction.onClicked.addListener(debouncedClickHandler);
