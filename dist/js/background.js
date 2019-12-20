/******/ (function(modules) { // webpackBootstrap
/******/ 	// install a JSONP callback for chunk loading
/******/ 	function webpackJsonpCallback(data) {
/******/ 		var chunkIds = data[0];
/******/ 		var moreModules = data[1];
/******/ 		var executeModules = data[2];
/******/
/******/ 		// add "moreModules" to the modules object,
/******/ 		// then flag all "chunkIds" as loaded and fire callback
/******/ 		var moduleId, chunkId, i = 0, resolves = [];
/******/ 		for(;i < chunkIds.length; i++) {
/******/ 			chunkId = chunkIds[i];
/******/ 			if(installedChunks[chunkId]) {
/******/ 				resolves.push(installedChunks[chunkId][0]);
/******/ 			}
/******/ 			installedChunks[chunkId] = 0;
/******/ 		}
/******/ 		for(moduleId in moreModules) {
/******/ 			if(Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
/******/ 				modules[moduleId] = moreModules[moduleId];
/******/ 			}
/******/ 		}
/******/ 		if(parentJsonpFunction) parentJsonpFunction(data);
/******/
/******/ 		while(resolves.length) {
/******/ 			resolves.shift()();
/******/ 		}
/******/
/******/ 		// add entry modules from loaded chunk to deferred list
/******/ 		deferredModules.push.apply(deferredModules, executeModules || []);
/******/
/******/ 		// run deferred modules when all chunks ready
/******/ 		return checkDeferredModules();
/******/ 	};
/******/ 	function checkDeferredModules() {
/******/ 		var result;
/******/ 		for(var i = 0; i < deferredModules.length; i++) {
/******/ 			var deferredModule = deferredModules[i];
/******/ 			var fulfilled = true;
/******/ 			for(var j = 1; j < deferredModule.length; j++) {
/******/ 				var depId = deferredModule[j];
/******/ 				if(installedChunks[depId] !== 0) fulfilled = false;
/******/ 			}
/******/ 			if(fulfilled) {
/******/ 				deferredModules.splice(i--, 1);
/******/ 				result = __webpack_require__(__webpack_require__.s = deferredModule[0]);
/******/ 			}
/******/ 		}
/******/ 		return result;
/******/ 	}
/******/
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// object to store loaded and loading chunks
/******/ 	// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 	// Promise = chunk loading, 0 = chunk loaded
/******/ 	var installedChunks = {
/******/ 		"background": 0
/******/ 	};
/******/
/******/ 	var deferredModules = [];
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	var jsonpArray = window["webpackJsonp"] = window["webpackJsonp"] || [];
/******/ 	var oldJsonpFunction = jsonpArray.push.bind(jsonpArray);
/******/ 	jsonpArray.push = webpackJsonpCallback;
/******/ 	jsonpArray = jsonpArray.slice();
/******/ 	for(var i = 0; i < jsonpArray.length; i++) webpackJsonpCallback(jsonpArray[i]);
/******/ 	var parentJsonpFunction = oldJsonpFunction;
/******/
/******/
/******/ 	// add entry module to deferred list
/******/ 	deferredModules.push(["./src/typescript/background.ts","vendor"]);
/******/ 	// run deferred modules when ready
/******/ 	return checkDeferredModules();
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/typescript/background.ts":
/*!**************************************!*\
  !*** ./src/typescript/background.ts ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = __webpack_require__(/*! ./helpers */ "./src/typescript/helpers.ts");
// On button click, check if there are savedTabs.
//  If yes, open them
//  If no, check if there are open tabs besides newtab
//    If yes, save them, close them, open preview page.
//    If no, ignore
const GlobalState = { tabs: [] };
// On change of
Object.defineProperty(GlobalState, 'tabs', {
    set(tabs) {
        this.value = tabs;
        console.log(tabs);
        BtnHandler.updateBadge(tabs);
    },
    get() {
        return this.value;
    },
});
class BtnHandler {
    constructor() {
        this.localState = {
            previewTabId: null,
        };
        this.saveAndCloseTabs = (tabs) => {
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
            }
            else {
                console.log('No tabs to save, doing nothing.');
            }
        };
        this.openPreviewWindow = () => {
            chrome.tabs.create({ url: chrome.runtime.getURL('preview.html'), active: true }, ({ id }) => (this.localState.previewTabId = id));
        };
        this.closePreviewWindow = () => {
            if (this.localState.previewTabId) {
                chrome.tabs.remove(this.localState.previewTabId);
                this.localState.previewTabId = null;
            }
        };
        this.closeAllTabs = (ids) => {
            console.log(`Closing ${ids.length} tabs.`);
            chrome.tabs.remove(ids);
        };
        this.restoreAllTabs = (tabs) => {
            console.log(`Restoring ${tabs.length} tabs.`);
            try {
                tabs.forEach(({ url, active }) => chrome.tabs.create({ url, active }));
                // If successfully restored (without throwing error) remove from storage
                chrome.storage.local.set({ savedTabs: [] });
                GlobalState.tabs = [];
            }
            catch (error) {
                console.error(error);
            }
        };
        this.handleBtnClick = () => {
            chrome.storage.local.get(['savedTabs'], (storage) => {
                // If there are tabs saved, restore them. Otherwise save and close the current tabs.
                if (storage.savedTabs && storage.savedTabs.length) {
                    this.restoreAllTabs(storage.savedTabs);
                    this.closePreviewWindow();
                }
                else {
                    chrome.tabs.query({ currentWindow: true }, this.saveAndCloseTabs);
                }
            });
        };
    }
    static updateBadge(tabs) {
        // On update of value, if there are tabs, set the tooltip to a preview of the domains.
        if (tabs.length > 0) {
            const domains = tabs.map(tab => tab.url.split('//')[1].split('/')[0]);
            let domainDisplay = `${tabs.length} tabs currently saved:\n`;
            // Display the first 5 domains in the tooltip.
            for (let i = 0; i < (domains.length > 5 ? 5 : domains.length); ++i) {
                // If we're on the last one, don't display the comma.
                domainDisplay += i === (domains.length > 5 ? 4 : domains.length - 1) ? `${domains[i]}\n` : `${domains[i]},\n`;
            }
            if (domains.length > 5)
                domainDisplay += `and ${domains.length - 5} more.`;
            chrome.browserAction.setBadgeText({ text: tabs.length.toString() });
            chrome.browserAction.setTitle({ title: domainDisplay });
        }
        else {
            chrome.browserAction.setBadgeText({ text: '' });
            chrome.browserAction.setTitle({ title: `Click me to save your tabs!` });
        }
    }
}
class MessageHandler {
    constructor() {
        this.tabId = null;
        this.sendResponse = (data) => {
            chrome.tabs.sendMessage(this.tabId, data);
        };
        this.onMessage = ({ type, data }, sender) => {
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
                        console.error('Tab removal request recieved but no tab included to remove');
                        this.sendResponse({ status: 'failure', data: [] });
                        return;
                    }
                    console.log(`Removing tab index ${data}.`);
                    const newTabs = GlobalState.tabs.filter((_, i) => i !== Number.parseInt(data));
                    GlobalState.tabs = newTabs;
                    this.sendResponse({ status: 'success', data: GlobalState.tabs });
                    break;
                default:
                    console.error(`Invalid request type sent to background script: ${type}`);
            }
        };
    }
}
const MessageHandlerRef = new MessageHandler();
chrome.runtime.onMessage.addListener(MessageHandlerRef.onMessage);
const BtnHandlerRef = new BtnHandler();
// On startup, check for tabs in storage. If there are any, update state and open window.
chrome.storage.local.get(['savedTabs'], (storage) => {
    if (storage.savedTabs && storage.savedTabs.length) {
        GlobalState.tabs = storage.savedTabs;
        BtnHandlerRef.openPreviewWindow();
    }
});
const debouncedClickHandler = helpers_1.debounce(200, BtnHandlerRef.handleBtnClick);
chrome.browserAction.onClicked.addListener(debouncedClickHandler);


/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL3R5cGVzY3JpcHQvYmFja2dyb3VuZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxnQkFBUSxvQkFBb0I7QUFDNUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5QkFBaUIsNEJBQTRCO0FBQzdDO0FBQ0E7QUFDQSwwQkFBa0IsMkJBQTJCO0FBQzdDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGtEQUEwQyxnQ0FBZ0M7QUFDMUU7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxnRUFBd0Qsa0JBQWtCO0FBQzFFO0FBQ0EseURBQWlELGNBQWM7QUFDL0Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlEQUF5QyxpQ0FBaUM7QUFDMUUsd0hBQWdILG1CQUFtQixFQUFFO0FBQ3JJO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsbUNBQTJCLDBCQUEwQixFQUFFO0FBQ3ZELHlDQUFpQyxlQUFlO0FBQ2hEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhEQUFzRCwrREFBK0Q7O0FBRXJIO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3QkFBZ0IsdUJBQXVCO0FBQ3ZDOzs7QUFHQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7OztBQ3RKYTtBQUNiLDhDQUE4QyxjQUFjO0FBQzVELGtCQUFrQixtQkFBTyxDQUFDLDhDQUFXO0FBQ3JDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxLQUFLO0FBQ0wsQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNDQUFzQyxtQkFBbUI7QUFDekQsMENBQTBDLHlCQUF5QjtBQUNuRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0NBQWdDLDJEQUEyRCxJQUFJLEtBQUs7QUFDcEc7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1DQUFtQyxXQUFXO0FBQzlDO0FBQ0E7QUFDQTtBQUNBLHFDQUFxQyxZQUFZO0FBQ2pEO0FBQ0EsK0JBQStCLGNBQWMseUJBQXlCLGNBQWM7QUFDcEY7QUFDQSwwQ0FBMEMsZ0JBQWdCO0FBQzFEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1Q0FBdUMsc0JBQXNCO0FBQzdEO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1DQUFtQyxZQUFZO0FBQy9DO0FBQ0EsMkJBQTJCLCtDQUErQztBQUMxRTtBQUNBLDBGQUEwRixXQUFXLFNBQVMsV0FBVztBQUN6SDtBQUNBO0FBQ0Esd0NBQXdDLG1CQUFtQjtBQUMzRCwrQ0FBK0MsK0JBQStCO0FBQzlFLDJDQUEyQyx1QkFBdUI7QUFDbEU7QUFDQTtBQUNBLCtDQUErQyxXQUFXO0FBQzFELDJDQUEyQyx1Q0FBdUM7QUFDbEY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkJBQTJCLGFBQWE7QUFDeEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJDQUEyQyw4QkFBOEI7QUFDekU7QUFDQTtBQUNBLHVDQUF1Qyw0Q0FBNEM7QUFDbkY7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyQ0FBMkMsOEJBQThCO0FBQ3pFO0FBQ0E7QUFDQSxzREFBc0QsS0FBSztBQUMzRDtBQUNBO0FBQ0EsdUNBQXVDLDRDQUE0QztBQUNuRjtBQUNBO0FBQ0EscUZBQXFGLEtBQUs7QUFDMUY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0Q7QUFDQSIsImZpbGUiOiJiYWNrZ3JvdW5kLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gaW5zdGFsbCBhIEpTT05QIGNhbGxiYWNrIGZvciBjaHVuayBsb2FkaW5nXG4gXHRmdW5jdGlvbiB3ZWJwYWNrSnNvbnBDYWxsYmFjayhkYXRhKSB7XG4gXHRcdHZhciBjaHVua0lkcyA9IGRhdGFbMF07XG4gXHRcdHZhciBtb3JlTW9kdWxlcyA9IGRhdGFbMV07XG4gXHRcdHZhciBleGVjdXRlTW9kdWxlcyA9IGRhdGFbMl07XG5cbiBcdFx0Ly8gYWRkIFwibW9yZU1vZHVsZXNcIiB0byB0aGUgbW9kdWxlcyBvYmplY3QsXG4gXHRcdC8vIHRoZW4gZmxhZyBhbGwgXCJjaHVua0lkc1wiIGFzIGxvYWRlZCBhbmQgZmlyZSBjYWxsYmFja1xuIFx0XHR2YXIgbW9kdWxlSWQsIGNodW5rSWQsIGkgPSAwLCByZXNvbHZlcyA9IFtdO1xuIFx0XHRmb3IoO2kgPCBjaHVua0lkcy5sZW5ndGg7IGkrKykge1xuIFx0XHRcdGNodW5rSWQgPSBjaHVua0lkc1tpXTtcbiBcdFx0XHRpZihpbnN0YWxsZWRDaHVua3NbY2h1bmtJZF0pIHtcbiBcdFx0XHRcdHJlc29sdmVzLnB1c2goaW5zdGFsbGVkQ2h1bmtzW2NodW5rSWRdWzBdKTtcbiBcdFx0XHR9XG4gXHRcdFx0aW5zdGFsbGVkQ2h1bmtzW2NodW5rSWRdID0gMDtcbiBcdFx0fVxuIFx0XHRmb3IobW9kdWxlSWQgaW4gbW9yZU1vZHVsZXMpIHtcbiBcdFx0XHRpZihPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwobW9yZU1vZHVsZXMsIG1vZHVsZUlkKSkge1xuIFx0XHRcdFx0bW9kdWxlc1ttb2R1bGVJZF0gPSBtb3JlTW9kdWxlc1ttb2R1bGVJZF07XG4gXHRcdFx0fVxuIFx0XHR9XG4gXHRcdGlmKHBhcmVudEpzb25wRnVuY3Rpb24pIHBhcmVudEpzb25wRnVuY3Rpb24oZGF0YSk7XG5cbiBcdFx0d2hpbGUocmVzb2x2ZXMubGVuZ3RoKSB7XG4gXHRcdFx0cmVzb2x2ZXMuc2hpZnQoKSgpO1xuIFx0XHR9XG5cbiBcdFx0Ly8gYWRkIGVudHJ5IG1vZHVsZXMgZnJvbSBsb2FkZWQgY2h1bmsgdG8gZGVmZXJyZWQgbGlzdFxuIFx0XHRkZWZlcnJlZE1vZHVsZXMucHVzaC5hcHBseShkZWZlcnJlZE1vZHVsZXMsIGV4ZWN1dGVNb2R1bGVzIHx8IFtdKTtcblxuIFx0XHQvLyBydW4gZGVmZXJyZWQgbW9kdWxlcyB3aGVuIGFsbCBjaHVua3MgcmVhZHlcbiBcdFx0cmV0dXJuIGNoZWNrRGVmZXJyZWRNb2R1bGVzKCk7XG4gXHR9O1xuIFx0ZnVuY3Rpb24gY2hlY2tEZWZlcnJlZE1vZHVsZXMoKSB7XG4gXHRcdHZhciByZXN1bHQ7XG4gXHRcdGZvcih2YXIgaSA9IDA7IGkgPCBkZWZlcnJlZE1vZHVsZXMubGVuZ3RoOyBpKyspIHtcbiBcdFx0XHR2YXIgZGVmZXJyZWRNb2R1bGUgPSBkZWZlcnJlZE1vZHVsZXNbaV07XG4gXHRcdFx0dmFyIGZ1bGZpbGxlZCA9IHRydWU7XG4gXHRcdFx0Zm9yKHZhciBqID0gMTsgaiA8IGRlZmVycmVkTW9kdWxlLmxlbmd0aDsgaisrKSB7XG4gXHRcdFx0XHR2YXIgZGVwSWQgPSBkZWZlcnJlZE1vZHVsZVtqXTtcbiBcdFx0XHRcdGlmKGluc3RhbGxlZENodW5rc1tkZXBJZF0gIT09IDApIGZ1bGZpbGxlZCA9IGZhbHNlO1xuIFx0XHRcdH1cbiBcdFx0XHRpZihmdWxmaWxsZWQpIHtcbiBcdFx0XHRcdGRlZmVycmVkTW9kdWxlcy5zcGxpY2UoaS0tLCAxKTtcbiBcdFx0XHRcdHJlc3VsdCA9IF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gZGVmZXJyZWRNb2R1bGVbMF0pO1xuIFx0XHRcdH1cbiBcdFx0fVxuIFx0XHRyZXR1cm4gcmVzdWx0O1xuIFx0fVxuXG4gXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBvYmplY3QgdG8gc3RvcmUgbG9hZGVkIGFuZCBsb2FkaW5nIGNodW5rc1xuIFx0Ly8gdW5kZWZpbmVkID0gY2h1bmsgbm90IGxvYWRlZCwgbnVsbCA9IGNodW5rIHByZWxvYWRlZC9wcmVmZXRjaGVkXG4gXHQvLyBQcm9taXNlID0gY2h1bmsgbG9hZGluZywgMCA9IGNodW5rIGxvYWRlZFxuIFx0dmFyIGluc3RhbGxlZENodW5rcyA9IHtcbiBcdFx0XCJiYWNrZ3JvdW5kXCI6IDBcbiBcdH07XG5cbiBcdHZhciBkZWZlcnJlZE1vZHVsZXMgPSBbXTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZ2V0dGVyIH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSBmdW5jdGlvbihleHBvcnRzKSB7XG4gXHRcdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuIFx0XHR9XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG4gXHR9O1xuXG4gXHQvLyBjcmVhdGUgYSBmYWtlIG5hbWVzcGFjZSBvYmplY3RcbiBcdC8vIG1vZGUgJiAxOiB2YWx1ZSBpcyBhIG1vZHVsZSBpZCwgcmVxdWlyZSBpdFxuIFx0Ly8gbW9kZSAmIDI6IG1lcmdlIGFsbCBwcm9wZXJ0aWVzIG9mIHZhbHVlIGludG8gdGhlIG5zXG4gXHQvLyBtb2RlICYgNDogcmV0dXJuIHZhbHVlIHdoZW4gYWxyZWFkeSBucyBvYmplY3RcbiBcdC8vIG1vZGUgJiA4fDE6IGJlaGF2ZSBsaWtlIHJlcXVpcmVcbiBcdF9fd2VicGFja19yZXF1aXJlX18udCA9IGZ1bmN0aW9uKHZhbHVlLCBtb2RlKSB7XG4gXHRcdGlmKG1vZGUgJiAxKSB2YWx1ZSA9IF9fd2VicGFja19yZXF1aXJlX18odmFsdWUpO1xuIFx0XHRpZihtb2RlICYgOCkgcmV0dXJuIHZhbHVlO1xuIFx0XHRpZigobW9kZSAmIDQpICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgJiYgdmFsdWUuX19lc01vZHVsZSkgcmV0dXJuIHZhbHVlO1xuIFx0XHR2YXIgbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIobnMpO1xuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkobnMsICdkZWZhdWx0JywgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdmFsdWUgfSk7XG4gXHRcdGlmKG1vZGUgJiAyICYmIHR5cGVvZiB2YWx1ZSAhPSAnc3RyaW5nJykgZm9yKHZhciBrZXkgaW4gdmFsdWUpIF9fd2VicGFja19yZXF1aXJlX18uZChucywga2V5LCBmdW5jdGlvbihrZXkpIHsgcmV0dXJuIHZhbHVlW2tleV07IH0uYmluZChudWxsLCBrZXkpKTtcbiBcdFx0cmV0dXJuIG5zO1xuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuIFx0dmFyIGpzb25wQXJyYXkgPSB3aW5kb3dbXCJ3ZWJwYWNrSnNvbnBcIl0gPSB3aW5kb3dbXCJ3ZWJwYWNrSnNvbnBcIl0gfHwgW107XG4gXHR2YXIgb2xkSnNvbnBGdW5jdGlvbiA9IGpzb25wQXJyYXkucHVzaC5iaW5kKGpzb25wQXJyYXkpO1xuIFx0anNvbnBBcnJheS5wdXNoID0gd2VicGFja0pzb25wQ2FsbGJhY2s7XG4gXHRqc29ucEFycmF5ID0ganNvbnBBcnJheS5zbGljZSgpO1xuIFx0Zm9yKHZhciBpID0gMDsgaSA8IGpzb25wQXJyYXkubGVuZ3RoOyBpKyspIHdlYnBhY2tKc29ucENhbGxiYWNrKGpzb25wQXJyYXlbaV0pO1xuIFx0dmFyIHBhcmVudEpzb25wRnVuY3Rpb24gPSBvbGRKc29ucEZ1bmN0aW9uO1xuXG5cbiBcdC8vIGFkZCBlbnRyeSBtb2R1bGUgdG8gZGVmZXJyZWQgbGlzdFxuIFx0ZGVmZXJyZWRNb2R1bGVzLnB1c2goW1wiLi9zcmMvdHlwZXNjcmlwdC9iYWNrZ3JvdW5kLnRzXCIsXCJ2ZW5kb3JcIl0pO1xuIFx0Ly8gcnVuIGRlZmVycmVkIG1vZHVsZXMgd2hlbiByZWFkeVxuIFx0cmV0dXJuIGNoZWNrRGVmZXJyZWRNb2R1bGVzKCk7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IGhlbHBlcnNfMSA9IHJlcXVpcmUoXCIuL2hlbHBlcnNcIik7XG4vLyBPbiBidXR0b24gY2xpY2ssIGNoZWNrIGlmIHRoZXJlIGFyZSBzYXZlZFRhYnMuXG4vLyAgSWYgeWVzLCBvcGVuIHRoZW1cbi8vICBJZiBubywgY2hlY2sgaWYgdGhlcmUgYXJlIG9wZW4gdGFicyBiZXNpZGVzIG5ld3RhYlxuLy8gICAgSWYgeWVzLCBzYXZlIHRoZW0sIGNsb3NlIHRoZW0sIG9wZW4gcHJldmlldyBwYWdlLlxuLy8gICAgSWYgbm8sIGlnbm9yZVxuY29uc3QgR2xvYmFsU3RhdGUgPSB7IHRhYnM6IFtdIH07XG4vLyBPbiBjaGFuZ2Ugb2Zcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShHbG9iYWxTdGF0ZSwgJ3RhYnMnLCB7XG4gICAgc2V0KHRhYnMpIHtcbiAgICAgICAgdGhpcy52YWx1ZSA9IHRhYnM7XG4gICAgICAgIGNvbnNvbGUubG9nKHRhYnMpO1xuICAgICAgICBCdG5IYW5kbGVyLnVwZGF0ZUJhZGdlKHRhYnMpO1xuICAgIH0sXG4gICAgZ2V0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy52YWx1ZTtcbiAgICB9LFxufSk7XG5jbGFzcyBCdG5IYW5kbGVyIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5sb2NhbFN0YXRlID0ge1xuICAgICAgICAgICAgcHJldmlld1RhYklkOiBudWxsLFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLnNhdmVBbmRDbG9zZVRhYnMgPSAodGFicykgPT4ge1xuICAgICAgICAgICAgLy8gRmlsdGVyIG91dCB1bi1zYXZhYmxlIHRhYnNcbiAgICAgICAgICAgIGNvbnN0IHNhdmFibGVUYWJzID0gdGFicy5maWx0ZXIodGFiID0+ICh0YWIudXJsICYmIHRhYi50aXRsZSAmJiAhdGFiLmluY29nbml0byA/IHRydWUgOiBmYWxzZSkpO1xuICAgICAgICAgICAgaWYgKHNhdmFibGVUYWJzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBTYXZpbmcgJHtzYXZhYmxlVGFicy5sZW5ndGh9IHRhYnMuYCk7XG4gICAgICAgICAgICAgICAgY2hyb21lLnN0b3JhZ2UubG9jYWwuc2V0KHsgc2F2ZWRUYWJzOiBzYXZhYmxlVGFicyB9KTtcbiAgICAgICAgICAgICAgICAvLyBVcGRhdGluZyB0aGlzIHZhbHVlIGFsc28gdXBkYXRlcyB0aGUgYmFkZ2UuXG4gICAgICAgICAgICAgICAgR2xvYmFsU3RhdGUudGFicyA9IHNhdmFibGVUYWJzO1xuICAgICAgICAgICAgICAgIC8vIE9wZW4gLyBoaWdobGlnaHQgcHJldmlldyB3aW5kb3cgYmVmb3JlIGNsb3Npbmcgc2F2YWJsZVRhYnMuXG4gICAgICAgICAgICAgICAgdGhpcy5vcGVuUHJldmlld1dpbmRvdygpO1xuICAgICAgICAgICAgICAgIHRoaXMuY2xvc2VBbGxUYWJzKHNhdmFibGVUYWJzLm1hcCh0YWIgPT4gdGFiLmlkKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnTm8gdGFicyB0byBzYXZlLCBkb2luZyBub3RoaW5nLicpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICB0aGlzLm9wZW5QcmV2aWV3V2luZG93ID0gKCkgPT4ge1xuICAgICAgICAgICAgY2hyb21lLnRhYnMuY3JlYXRlKHsgdXJsOiBjaHJvbWUucnVudGltZS5nZXRVUkwoJ3ByZXZpZXcuaHRtbCcpLCBhY3RpdmU6IHRydWUgfSwgKHsgaWQgfSkgPT4gKHRoaXMubG9jYWxTdGF0ZS5wcmV2aWV3VGFiSWQgPSBpZCkpO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLmNsb3NlUHJldmlld1dpbmRvdyA9ICgpID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLmxvY2FsU3RhdGUucHJldmlld1RhYklkKSB7XG4gICAgICAgICAgICAgICAgY2hyb21lLnRhYnMucmVtb3ZlKHRoaXMubG9jYWxTdGF0ZS5wcmV2aWV3VGFiSWQpO1xuICAgICAgICAgICAgICAgIHRoaXMubG9jYWxTdGF0ZS5wcmV2aWV3VGFiSWQgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICB0aGlzLmNsb3NlQWxsVGFicyA9IChpZHMpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBDbG9zaW5nICR7aWRzLmxlbmd0aH0gdGFicy5gKTtcbiAgICAgICAgICAgIGNocm9tZS50YWJzLnJlbW92ZShpZHMpO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLnJlc3RvcmVBbGxUYWJzID0gKHRhYnMpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBSZXN0b3JpbmcgJHt0YWJzLmxlbmd0aH0gdGFicy5gKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdGFicy5mb3JFYWNoKCh7IHVybCwgYWN0aXZlIH0pID0+IGNocm9tZS50YWJzLmNyZWF0ZSh7IHVybCwgYWN0aXZlIH0pKTtcbiAgICAgICAgICAgICAgICAvLyBJZiBzdWNjZXNzZnVsbHkgcmVzdG9yZWQgKHdpdGhvdXQgdGhyb3dpbmcgZXJyb3IpIHJlbW92ZSBmcm9tIHN0b3JhZ2VcbiAgICAgICAgICAgICAgICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5zZXQoeyBzYXZlZFRhYnM6IFtdIH0pO1xuICAgICAgICAgICAgICAgIEdsb2JhbFN0YXRlLnRhYnMgPSBbXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICB0aGlzLmhhbmRsZUJ0bkNsaWNrID0gKCkgPT4ge1xuICAgICAgICAgICAgY2hyb21lLnN0b3JhZ2UubG9jYWwuZ2V0KFsnc2F2ZWRUYWJzJ10sIChzdG9yYWdlKSA9PiB7XG4gICAgICAgICAgICAgICAgLy8gSWYgdGhlcmUgYXJlIHRhYnMgc2F2ZWQsIHJlc3RvcmUgdGhlbS4gT3RoZXJ3aXNlIHNhdmUgYW5kIGNsb3NlIHRoZSBjdXJyZW50IHRhYnMuXG4gICAgICAgICAgICAgICAgaWYgKHN0b3JhZ2Uuc2F2ZWRUYWJzICYmIHN0b3JhZ2Uuc2F2ZWRUYWJzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlc3RvcmVBbGxUYWJzKHN0b3JhZ2Uuc2F2ZWRUYWJzKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jbG9zZVByZXZpZXdXaW5kb3coKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNocm9tZS50YWJzLnF1ZXJ5KHsgY3VycmVudFdpbmRvdzogdHJ1ZSB9LCB0aGlzLnNhdmVBbmRDbG9zZVRhYnMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgIH1cbiAgICBzdGF0aWMgdXBkYXRlQmFkZ2UodGFicykge1xuICAgICAgICAvLyBPbiB1cGRhdGUgb2YgdmFsdWUsIGlmIHRoZXJlIGFyZSB0YWJzLCBzZXQgdGhlIHRvb2x0aXAgdG8gYSBwcmV2aWV3IG9mIHRoZSBkb21haW5zLlxuICAgICAgICBpZiAodGFicy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBjb25zdCBkb21haW5zID0gdGFicy5tYXAodGFiID0+IHRhYi51cmwuc3BsaXQoJy8vJylbMV0uc3BsaXQoJy8nKVswXSk7XG4gICAgICAgICAgICBsZXQgZG9tYWluRGlzcGxheSA9IGAke3RhYnMubGVuZ3RofSB0YWJzIGN1cnJlbnRseSBzYXZlZDpcXG5gO1xuICAgICAgICAgICAgLy8gRGlzcGxheSB0aGUgZmlyc3QgNSBkb21haW5zIGluIHRoZSB0b29sdGlwLlxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCAoZG9tYWlucy5sZW5ndGggPiA1ID8gNSA6IGRvbWFpbnMubGVuZ3RoKTsgKytpKSB7XG4gICAgICAgICAgICAgICAgLy8gSWYgd2UncmUgb24gdGhlIGxhc3Qgb25lLCBkb24ndCBkaXNwbGF5IHRoZSBjb21tYS5cbiAgICAgICAgICAgICAgICBkb21haW5EaXNwbGF5ICs9IGkgPT09IChkb21haW5zLmxlbmd0aCA+IDUgPyA0IDogZG9tYWlucy5sZW5ndGggLSAxKSA/IGAke2RvbWFpbnNbaV19XFxuYCA6IGAke2RvbWFpbnNbaV19LFxcbmA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZG9tYWlucy5sZW5ndGggPiA1KVxuICAgICAgICAgICAgICAgIGRvbWFpbkRpc3BsYXkgKz0gYGFuZCAke2RvbWFpbnMubGVuZ3RoIC0gNX0gbW9yZS5gO1xuICAgICAgICAgICAgY2hyb21lLmJyb3dzZXJBY3Rpb24uc2V0QmFkZ2VUZXh0KHsgdGV4dDogdGFicy5sZW5ndGgudG9TdHJpbmcoKSB9KTtcbiAgICAgICAgICAgIGNocm9tZS5icm93c2VyQWN0aW9uLnNldFRpdGxlKHsgdGl0bGU6IGRvbWFpbkRpc3BsYXkgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjaHJvbWUuYnJvd3NlckFjdGlvbi5zZXRCYWRnZVRleHQoeyB0ZXh0OiAnJyB9KTtcbiAgICAgICAgICAgIGNocm9tZS5icm93c2VyQWN0aW9uLnNldFRpdGxlKHsgdGl0bGU6IGBDbGljayBtZSB0byBzYXZlIHlvdXIgdGFicyFgIH0pO1xuICAgICAgICB9XG4gICAgfVxufVxuY2xhc3MgTWVzc2FnZUhhbmRsZXIge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLnRhYklkID0gbnVsbDtcbiAgICAgICAgdGhpcy5zZW5kUmVzcG9uc2UgPSAoZGF0YSkgPT4ge1xuICAgICAgICAgICAgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UodGhpcy50YWJJZCwgZGF0YSk7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMub25NZXNzYWdlID0gKHsgdHlwZSwgZGF0YSB9LCBzZW5kZXIpID0+IHtcbiAgICAgICAgICAgIHRoaXMudGFiSWQgPSBzZW5kZXIudGFiLmlkO1xuICAgICAgICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnZ2V0VGFicyc6XG4gICAgICAgICAgICAgICAgICAgIGlmICghR2xvYmFsU3RhdGUudGFicy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1RhYnMgcmVxdWVzdGVkIGJ1dCBub25lIGluIGdsb2JhbCBzdGF0ZT8nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2VuZFJlc3BvbnNlKHsgc3RhdHVzOiAnZmFpbHVyZScsIGRhdGE6IFtdIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VuZFJlc3BvbnNlKHsgc3RhdHVzOiAnc3VjY2VzcycsIGRhdGE6IEdsb2JhbFN0YXRlLnRhYnMgfSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ3JlbW92ZVRhYic6XG4gICAgICAgICAgICAgICAgICAgIGlmIChkYXRhID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1RhYiByZW1vdmFsIHJlcXVlc3QgcmVjaWV2ZWQgYnV0IG5vIHRhYiBpbmNsdWRlZCB0byByZW1vdmUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2VuZFJlc3BvbnNlKHsgc3RhdHVzOiAnZmFpbHVyZScsIGRhdGE6IFtdIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBSZW1vdmluZyB0YWIgaW5kZXggJHtkYXRhfS5gKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV3VGFicyA9IEdsb2JhbFN0YXRlLnRhYnMuZmlsdGVyKChfLCBpKSA9PiBpICE9PSBOdW1iZXIucGFyc2VJbnQoZGF0YSkpO1xuICAgICAgICAgICAgICAgICAgICBHbG9iYWxTdGF0ZS50YWJzID0gbmV3VGFicztcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZW5kUmVzcG9uc2UoeyBzdGF0dXM6ICdzdWNjZXNzJywgZGF0YTogR2xvYmFsU3RhdGUudGFicyB9KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgSW52YWxpZCByZXF1ZXN0IHR5cGUgc2VudCB0byBiYWNrZ3JvdW5kIHNjcmlwdDogJHt0eXBlfWApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH1cbn1cbmNvbnN0IE1lc3NhZ2VIYW5kbGVyUmVmID0gbmV3IE1lc3NhZ2VIYW5kbGVyKCk7XG5jaHJvbWUucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoTWVzc2FnZUhhbmRsZXJSZWYub25NZXNzYWdlKTtcbmNvbnN0IEJ0bkhhbmRsZXJSZWYgPSBuZXcgQnRuSGFuZGxlcigpO1xuLy8gT24gc3RhcnR1cCwgY2hlY2sgZm9yIHRhYnMgaW4gc3RvcmFnZS4gSWYgdGhlcmUgYXJlIGFueSwgdXBkYXRlIHN0YXRlIGFuZCBvcGVuIHdpbmRvdy5cbmNocm9tZS5zdG9yYWdlLmxvY2FsLmdldChbJ3NhdmVkVGFicyddLCAoc3RvcmFnZSkgPT4ge1xuICAgIGlmIChzdG9yYWdlLnNhdmVkVGFicyAmJiBzdG9yYWdlLnNhdmVkVGFicy5sZW5ndGgpIHtcbiAgICAgICAgR2xvYmFsU3RhdGUudGFicyA9IHN0b3JhZ2Uuc2F2ZWRUYWJzO1xuICAgICAgICBCdG5IYW5kbGVyUmVmLm9wZW5QcmV2aWV3V2luZG93KCk7XG4gICAgfVxufSk7XG5jb25zdCBkZWJvdW5jZWRDbGlja0hhbmRsZXIgPSBoZWxwZXJzXzEuZGVib3VuY2UoMjAwLCBCdG5IYW5kbGVyUmVmLmhhbmRsZUJ0bkNsaWNrKTtcbmNocm9tZS5icm93c2VyQWN0aW9uLm9uQ2xpY2tlZC5hZGRMaXN0ZW5lcihkZWJvdW5jZWRDbGlja0hhbmRsZXIpO1xuIl0sInNvdXJjZVJvb3QiOiIifQ==