const Trianglify = require('trianglify');
import { ResponseData } from '../types';

const defaultFavicon = 'notFoundIcon.svg';

const createTabItem = (tab: chrome.tabs.Tab): string => `
  <li class="tabItem">
    <div class="faviconBox">
      <img src="${tab.favIconUrl || defaultFavicon}" class="favicon" />
    </div>
    <div class="titleBox">
      <a href="${tab.url}" class="title" target="_blank" rel="noreferral noopener" alt="${tab.title}" title="${
  tab.title
}">${tab.title}</a>
      <span class="url">${tab.url}</span>
    </div>
  </li>
`;

// NOTE: This is potentially vulnerable to XSS attacks if the local storage is compromised,
// but since only this extension can access the local storage it shouldn't be a problem.
const createTabList = (tabs: chrome.tabs.Tab[]): string =>
  tabs.reduce((agg: string, tab) => agg + createTabItem(tab), '');

function generateBackground(): void {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const pattern = Trianglify({ width: window.innerWidth, height: window.innerHeight });
  pattern.canvas(canvas);
}

function onMessage({ status, data: tabs }: ResponseData): void {
  const tabListUl = document.getElementById('tabList');
  console.log('message received');
  if (status !== 'success') {
    console.error('Failed to get tabs?');
    return;
  }

  tabListUl.innerHTML = createTabList(tabs);
  document.title = `Tab Saver - ${tabs.length} tabs saved`;
  document.getElementById('count').innerText = `${tabs.length} tabs currently saved`;
  document.getElementById('count').style.visibility = 'visible';
}

window.addEventListener('load', () => {
  // On load, request data and initialize listeners.
  chrome.runtime.sendMessage({ type: 'getTabs' });
  chrome.runtime.onMessage.addListener(onMessage);

  generateBackground();
});
