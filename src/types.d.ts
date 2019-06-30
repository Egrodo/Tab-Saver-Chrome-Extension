export interface State {
  previewTabId: number | null;
}

export interface Storage {
  savedTabs: chrome.tabs.Tab[];
}
