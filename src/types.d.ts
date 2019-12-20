interface requestDataTypes {
  
}

export interface GlobalState {
  tabs: chrome.tabs.Tab[];
}

export interface BtnHandlerState {
  previewTabId: number | null;
}

export interface Storage {
  savedTabs: chrome.tabs.Tab[];
}

export interface RequestPackage {
  type: 'getTabs' | 'removeTab' | string;
  data?: string; // Currently this is only used for specifying a tab index to remove. Generalize in future if needed.
}

export interface ResponseData {
  status: 'success' | 'failure';
  data: chrome.tabs.Tab[];
}
