import { browser } from 'webextension-polyfill';
const Trianglify = require('trianglify');
import { debounce } from './helpers';

import { ResponseData } from '../types';

const closeButton = 'closeBtn.png';
const defaultFavicon = 'notFoundIcon.svg';

// TODO: When hover over the favicon, replace with a cross.
const createTabItem = (tab: browser.tabs.Tab): string => `
  <li class="tabItem">
    <div class="faviconBox" title="Click to remove from saved list">
      <img src="${
        tab.favIconUrl || defaultFavicon
      }" class="favicon" alt="favicon" data-tab-id="${
  tab.id
}" data-favicon-url="${tab.favIconUrl || defaultFavicon}"/>
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
      <input class="url" title="Click to select" alt="${tab.url}" value="${
  tab.url
}" readonly />
    </div>
  </li>
`;

// NOTE: This is potentially vulnerable to XSS attacks if the local storage is compromised,
// but since only this extension can access the local storage it shouldn't be a problem.
const createTabList = (tabs: browser.tabs.Tab[]): string =>
  tabs.reduce((agg: string, tab) => agg + createTabItem(tab), '');

function generateBackground(): void {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const pattern = Trianglify({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  pattern.canvas(canvas);
}

function resizeBackground(): void {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const pattern = Trianglify({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  pattern.canvas(canvas);
}

function removeSavedTab(tabId: string): void {
  browser.runtime.sendMessage({ type: 'removeTab', data: tabId });
}

function onMessage({ status, data: tabs }: ResponseData): void {
  const tabContainer = document.getElementById('tabContainer');
  if (status !== 'success') {
    console.error('Failed to get tabs.');
    document.getElementById('plural').innerText =
      'No currently saved tabs. Click the badge button to save your tabs!';
    return;
  }

  // On receiving message, first remove whatever content was already there, if any
  if (tabContainer.innerHTML) {
    tabContainer.innerHTML = '';
  }

  // On receiving message, create and render tab list, update tab counts, and add click handlers to url elements.
  tabContainer.innerHTML = createTabList(tabs);
  document.title = `Tab Saver - ${tabs.length} tabs saved`;
  document.getElementById('count').innerText = `${tabs.length} tab${
    tabs.length > 1 ? 's' : ''
  } currently saved.`;
  document.getElementById(
    'plural'
  ).innerText = `Click the badge button to reopen ${
    tabs.length > 1 ? 'them' : 'it'
  }!`;
  document.getElementById('count').style.visibility = 'visible';
  document.querySelectorAll('.url').forEach((url: HTMLInputElement) => {
    url.addEventListener('click', (e) =>
      (e.currentTarget as HTMLInputElement).select()
    );
  });
  document.querySelectorAll('.favicon').forEach((favicon: HTMLImageElement) => {
    // Indicate to the user that clicking the favicon will result in that item being removed from the saved list
    favicon.addEventListener('mouseover', (e) => {
      (e.currentTarget as HTMLImageElement).src = closeButton;
    });
    favicon.addEventListener('mouseout', (e) => {
      const originalFavicon = (e.currentTarget as HTMLImageElement).dataset
        .faviconUrl;
      (e.currentTarget as HTMLImageElement).src = originalFavicon;
    });
    favicon.addEventListener('click', (e) =>
      removeSavedTab((e.currentTarget as HTMLImageElement).dataset.tabId)
    );
  });
}

window.addEventListener('load', () => {
  // On load, request data and initialize listeners.
  browser.runtime.sendMessage({ type: 'getTabs' });
  browser.runtime.onMessage.addListener(onMessage);

  generateBackground();
});

// On resize, debounce and update the background canvas.
window.addEventListener('resize', resizeBackground);
