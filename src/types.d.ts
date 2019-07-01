export interface GlobalState {
  tabs: chrome.tabs.Tab[];
}

export interface BtnHandlerState {
  previewTabId: number | null;
}

export interface Storage {
  savedTabs: chrome.tabs.Tab[];
}

export interface RequestType {
  type: 'getTabs' | string;
}

export interface ResponseData {
  status: 'success' | 'failure';
  data: chrome.tabs.Tab[];
}
