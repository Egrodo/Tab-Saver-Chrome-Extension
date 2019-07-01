import { ResponseData } from '../types';

// TODO: Type this with lit-html types?
const defaultFavicon = '#';

const CreateTabItem = (tab: chrome.tabs.Tab): string => `
  <li class="tabItem">
    <div class="faviconBox">
      <img src="${tab.favIconUrl || defaultFavicon}" class="favicon" />
    </div>
    <div class="titleBox">
      <a href="${tab.url} class="title" target="_blank" rel="noreferral noopener">${tab.title}</a>
      <span class="url">${tab.url}</span>
    </div>
  </li>
`;

// TODO: Rewrite with template tag https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro/35385518#35385518
window.addEventListener('load', () => {
  const tabListUl = document.getElementById('tabList');

  // Send message requesting tab list from background script
  // TODO: Loading spinner until this returns
  function createTabList(tabs: chrome.tabs.Tab[]): string {
    // NOTE: This is potentially vulnerable to XSS attacks if the local storage is compromised. How to fix?
    const TabList: string = tabs.reduce((agg: string, tab) => agg + CreateTabItem(tab), '');

    return TabList;
  }

  function onMessage({ status, data }: ResponseData): void {
    console.log('message received');
    if (status !== 'success') {
      console.error('Failed to get tabs?');
      return;
    }

    tabListUl.innerHTML = createTabList(data);
  }

  chrome.runtime.sendMessage({ type: 'getTabs' });
  chrome.runtime.onMessage.addListener(onMessage);
});
