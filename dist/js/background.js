!function(e){var t={};function s(o){if(t[o])return t[o].exports;var r=t[o]={i:o,l:!1,exports:{}};return e[o].call(r.exports,r,r.exports,s),r.l=!0,r.exports}s.m=e,s.c=t,s.d=function(e,t,o){s.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:o})},s.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},s.t=function(e,t){if(1&t&&(e=s(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var o=Object.create(null);if(s.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)s.d(o,r,function(t){return e[t]}.bind(null,r));return o},s.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return s.d(t,"a",t),t},s.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},s.p="",s(s.s=22)}({22:function(e,t,s){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const o=s(23),r={tabs:[]};Object.defineProperty(r,"tabs",{set(e){this.value=e,n.updateBadge(e)},get(){return this.value}});class n{constructor(){this.localState={previewTabId:null},this.saveAndCloseTabs=(e=>{const t=e.filter(e=>!(!e.url||!e.title||e.incognito));t.length?(console.log(`Saving ${t.length} tabs.`),chrome.storage.local.set({savedTabs:t}),r.tabs=t,this.openPreviewWindow(),this.closeAllTabs(t.map(e=>e.id))):console.log("No tabs to save, doing nothing.")}),this.openPreviewWindow=(()=>{chrome.tabs.create({url:chrome.runtime.getURL("preview.html"),active:!0},({id:e})=>this.localState.previewTabId=e)}),this.closePreviewWindow=(()=>{this.localState.previewTabId&&(chrome.tabs.remove(this.localState.previewTabId),this.localState.previewTabId=null)}),this.closeAllTabs=(e=>{console.log(`Closing ${e.length} tabs.`),chrome.tabs.remove(e)}),this.restoreAllTabs=(e=>{console.log(`Restoring ${e.length} tabs.`);try{e.forEach(({url:e,active:t})=>chrome.tabs.create({url:e,active:t})),chrome.storage.local.set({savedTabs:[]}),r.tabs=[]}catch(e){console.error(e)}}),this.handleBtnClick=(()=>{chrome.storage.local.get(["savedTabs"],e=>{e.savedTabs&&e.savedTabs.length?(this.restoreAllTabs(e.savedTabs),this.closePreviewWindow()):chrome.tabs.query({currentWindow:!0},this.saveAndCloseTabs)})})}static updateBadge(e){if(e.length>0){const t=e.map(e=>e.url.split("//")[1].split("/")[0]);let s=`${e.length} tabs currently saved:\n`;for(let e=0;e<(t.length>5?5:t.length);++e)s+=e===(t.length>5?4:t.length-1)?`${t[e]}\n`:`${t[e]},\n`;t.length>5&&(s+=`and ${t.length-5} more.`),chrome.browserAction.setBadgeText({text:e.length.toString()}),chrome.browserAction.setTitle({title:s})}else chrome.browserAction.setBadgeText({text:""}),chrome.browserAction.setTitle({title:"Click me to save your tabs!"})}}const a=new class{constructor(){this.tabId=null,this.sendResponse=(e=>{chrome.tabs.sendMessage(this.tabId,e)}),this.onMessage=(({type:e},t)=>{switch(this.tabId=t.tab.id,e){case"getTabs":if(!r.tabs.length)return console.error("Tabs requested but none in global state?"),void this.sendResponse({status:"failure",data:[]});this.sendResponse({status:"success",data:r.tabs});break;default:console.error(`Invalid request type sent to background script: ${e}`)}})}};chrome.runtime.onMessage.addListener(a.onMessage);const l=new n;chrome.storage.local.get(["savedTabs"],e=>{e.savedTabs&&e.savedTabs.length&&(r.tabs=e.savedTabs,l.openPreviewWindow())});const i=o.debounce(200,l.handleBtnClick);chrome.browserAction.onClicked.addListener(i)},23:function(e,t,s){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.debounce=((e,t)=>{let s;return(...o)=>{s&&clearTimeout(s),s=setTimeout(()=>{t(...o),s=null},e)}})}});