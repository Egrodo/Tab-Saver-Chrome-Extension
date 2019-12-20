const Trianglify = require('trianglify');
import { debounce } from './helpers';

import { ResponseData } from '../types';

const defaultFavicon = 'notFoundIcon.svg';

// TODO: When hover over the favicon, replace with a cross.
const createTabItem = (tab: chrome.tabs.Tab): string => `
  <li class="tabItem">
    <div class="faviconBox" title="Click to remove from saved list">
      <img src="${tab.favIconUrl || defaultFavicon}" class="favicon" alt="favicon" data-tab-index="${tab.index}"/>
    </div>
    <div class="titleBox">
      <a
        href="${tab.url}"
        class="title"
        target="_blank"
        rel="noreferral noopener"
        alt="${tab.title}"
        title="${tab.title}"
      >
        ${tab.title}
      </a>
      <input class="url" title="Click to select" alt="${tab.url}" value="${tab.url}" readonly />
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

function removeSavedTab(tabIndex: string): void {
  chrome.runtime.sendMessage({ type: 'removeTab', data: tabIndex });
}

function onMessage({ status, data: tabs }: ResponseData): void {
  const tabListContainer = document.getElementById('tabContainer');
  const tabListUl = document.createElement('ul');
  if (status !== 'success') {
    console.error('Failed to get tabs.');
    document.getElementById('plural').innerText = 'No currently saved tabs. Click the badge button to save your tabs!';
    return;
  }

  // On receiving message, first remove whatever content was already there, if any
  if (tabListContainer.firstChild) {
    tabListContainer.firstChild.remove();
  }

  // On receiving message, create and render tab list, update tab counts, and add click handlers to url elements.
  tabListUl.innerHTML = createTabList(tabs);
  tabListContainer.appendChild(tabListUl);
  document.title = `Tab Saver - ${tabs.length} tabs saved`;
  document.getElementById('count').innerText = `${tabs.length} tab${tabs.length > 1 ? 's' : ''} currently saved.`;
  document.getElementById('plural').innerText = `Click the badge button to reopen ${tabs.length > 1 ? 'them' : 'it'}!`;
  document.getElementById('count').style.visibility = 'visible';
  document.querySelectorAll('.url').forEach((url: HTMLInputElement) => {
    url.addEventListener('click', e => (e.currentTarget as HTMLInputElement).select());
  });
  document.querySelectorAll('.favicon').forEach((favicon: HTMLImageElement) => {
    favicon.addEventListener('click', e => removeSavedTab((e.currentTarget as HTMLImageElement).dataset.tabIndex));
  });
}

window.addEventListener('load', () => {
  // On load, request data and initialize listeners.
  chrome.runtime.sendMessage({ type: 'getTabs' });
  chrome.runtime.onMessage.addListener(onMessage);

  generateBackground();
});

function resizeCanvas(): void {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const pattern = Trianglify({ width: window.innerWidth, height: window.innerHeight });
  pattern.canvas(canvas);
}

const debouncedResize = debounce(150, resizeCanvas)

// On resize, debounce and update the background canvas.
window.addEventListener('resize', debouncedResize);