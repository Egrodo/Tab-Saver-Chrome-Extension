/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
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
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/typescript/background.ts");
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
        this.onMessage = ({ type }, sender) => {
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


/***/ }),

/***/ "./src/typescript/helpers.ts":
/*!***********************************!*\
  !*** ./src/typescript/helpers.ts ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.debounce = (delay, fn) => {
    let timerId;
    return (...args) => {
        if (timerId)
            clearTimeout(timerId);
        timerId = setTimeout(() => {
            fn(...args);
            timerId = null;
        }, delay);
    };
};


/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL3R5cGVzY3JpcHQvYmFja2dyb3VuZC50cyIsIndlYnBhY2s6Ly8vLi9zcmMvdHlwZXNjcmlwdC9oZWxwZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGtEQUEwQyxnQ0FBZ0M7QUFDMUU7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxnRUFBd0Qsa0JBQWtCO0FBQzFFO0FBQ0EseURBQWlELGNBQWM7QUFDL0Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlEQUF5QyxpQ0FBaUM7QUFDMUUsd0hBQWdILG1CQUFtQixFQUFFO0FBQ3JJO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsbUNBQTJCLDBCQUEwQixFQUFFO0FBQ3ZELHlDQUFpQyxlQUFlO0FBQ2hEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhEQUFzRCwrREFBK0Q7O0FBRXJIO0FBQ0E7OztBQUdBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7QUNsRmE7QUFDYiw4Q0FBOEMsY0FBYztBQUM1RCxrQkFBa0IsbUJBQU8sQ0FBQyw4Q0FBVztBQUNyQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLEtBQUs7QUFDTCxDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0NBQXNDLG1CQUFtQjtBQUN6RCwwQ0FBMEMseUJBQXlCO0FBQ25FO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQ0FBZ0MsMkRBQTJELElBQUksS0FBSztBQUNwRztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUNBQW1DLFdBQVc7QUFDOUM7QUFDQTtBQUNBO0FBQ0EscUNBQXFDLFlBQVk7QUFDakQ7QUFDQSwrQkFBK0IsY0FBYyx5QkFBeUIsY0FBYztBQUNwRjtBQUNBLDBDQUEwQyxnQkFBZ0I7QUFDMUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHVDQUF1QyxzQkFBc0I7QUFDN0Q7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUNBQW1DLFlBQVk7QUFDL0M7QUFDQSwyQkFBMkIsK0NBQStDO0FBQzFFO0FBQ0EsMEZBQTBGLFdBQVcsU0FBUyxXQUFXO0FBQ3pIO0FBQ0E7QUFDQSx3Q0FBd0MsbUJBQW1CO0FBQzNELCtDQUErQywrQkFBK0I7QUFDOUUsMkNBQTJDLHVCQUF1QjtBQUNsRTtBQUNBO0FBQ0EsK0NBQStDLFdBQVc7QUFDMUQsMkNBQTJDLHVDQUF1QztBQUNsRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyQkFBMkIsT0FBTztBQUNsQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkNBQTJDLDhCQUE4QjtBQUN6RTtBQUNBO0FBQ0EsdUNBQXVDLDRDQUE0QztBQUNuRjtBQUNBO0FBQ0EscUZBQXFGLEtBQUs7QUFDMUY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0Q7QUFDQTs7Ozs7Ozs7Ozs7OztBQ3JJYTtBQUNiLDhDQUE4QyxjQUFjO0FBQzVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQSIsImZpbGUiOiJiYWNrZ3JvdW5kLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZ2V0dGVyIH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSBmdW5jdGlvbihleHBvcnRzKSB7XG4gXHRcdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuIFx0XHR9XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG4gXHR9O1xuXG4gXHQvLyBjcmVhdGUgYSBmYWtlIG5hbWVzcGFjZSBvYmplY3RcbiBcdC8vIG1vZGUgJiAxOiB2YWx1ZSBpcyBhIG1vZHVsZSBpZCwgcmVxdWlyZSBpdFxuIFx0Ly8gbW9kZSAmIDI6IG1lcmdlIGFsbCBwcm9wZXJ0aWVzIG9mIHZhbHVlIGludG8gdGhlIG5zXG4gXHQvLyBtb2RlICYgNDogcmV0dXJuIHZhbHVlIHdoZW4gYWxyZWFkeSBucyBvYmplY3RcbiBcdC8vIG1vZGUgJiA4fDE6IGJlaGF2ZSBsaWtlIHJlcXVpcmVcbiBcdF9fd2VicGFja19yZXF1aXJlX18udCA9IGZ1bmN0aW9uKHZhbHVlLCBtb2RlKSB7XG4gXHRcdGlmKG1vZGUgJiAxKSB2YWx1ZSA9IF9fd2VicGFja19yZXF1aXJlX18odmFsdWUpO1xuIFx0XHRpZihtb2RlICYgOCkgcmV0dXJuIHZhbHVlO1xuIFx0XHRpZigobW9kZSAmIDQpICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgJiYgdmFsdWUuX19lc01vZHVsZSkgcmV0dXJuIHZhbHVlO1xuIFx0XHR2YXIgbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIobnMpO1xuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkobnMsICdkZWZhdWx0JywgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdmFsdWUgfSk7XG4gXHRcdGlmKG1vZGUgJiAyICYmIHR5cGVvZiB2YWx1ZSAhPSAnc3RyaW5nJykgZm9yKHZhciBrZXkgaW4gdmFsdWUpIF9fd2VicGFja19yZXF1aXJlX18uZChucywga2V5LCBmdW5jdGlvbihrZXkpIHsgcmV0dXJuIHZhbHVlW2tleV07IH0uYmluZChudWxsLCBrZXkpKTtcbiBcdFx0cmV0dXJuIG5zO1xuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IFwiLi9zcmMvdHlwZXNjcmlwdC9iYWNrZ3JvdW5kLnRzXCIpO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxuY29uc3QgaGVscGVyc18xID0gcmVxdWlyZShcIi4vaGVscGVyc1wiKTtcclxuLy8gT24gYnV0dG9uIGNsaWNrLCBjaGVjayBpZiB0aGVyZSBhcmUgc2F2ZWRUYWJzLlxyXG4vLyAgSWYgeWVzLCBvcGVuIHRoZW1cclxuLy8gIElmIG5vLCBjaGVjayBpZiB0aGVyZSBhcmUgb3BlbiB0YWJzIGJlc2lkZXMgbmV3dGFiXHJcbi8vICAgIElmIHllcywgc2F2ZSB0aGVtLCBjbG9zZSB0aGVtLCBvcGVuIHByZXZpZXcgcGFnZS5cclxuLy8gICAgSWYgbm8sIGlnbm9yZVxyXG5jb25zdCBHbG9iYWxTdGF0ZSA9IHsgdGFiczogW10gfTtcclxuLy8gT24gY2hhbmdlIG9mXHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShHbG9iYWxTdGF0ZSwgJ3RhYnMnLCB7XHJcbiAgICBzZXQodGFicykge1xyXG4gICAgICAgIHRoaXMudmFsdWUgPSB0YWJzO1xyXG4gICAgICAgIEJ0bkhhbmRsZXIudXBkYXRlQmFkZ2UodGFicyk7XHJcbiAgICB9LFxyXG4gICAgZ2V0KCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnZhbHVlO1xyXG4gICAgfSxcclxufSk7XHJcbmNsYXNzIEJ0bkhhbmRsZXIge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5sb2NhbFN0YXRlID0ge1xyXG4gICAgICAgICAgICBwcmV2aWV3VGFiSWQ6IG51bGwsXHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLnNhdmVBbmRDbG9zZVRhYnMgPSAodGFicykgPT4ge1xyXG4gICAgICAgICAgICAvLyBGaWx0ZXIgb3V0IHVuLXNhdmFibGUgdGFic1xyXG4gICAgICAgICAgICBjb25zdCBzYXZhYmxlVGFicyA9IHRhYnMuZmlsdGVyKHRhYiA9PiAodGFiLnVybCAmJiB0YWIudGl0bGUgJiYgIXRhYi5pbmNvZ25pdG8gPyB0cnVlIDogZmFsc2UpKTtcclxuICAgICAgICAgICAgaWYgKHNhdmFibGVUYWJzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFNhdmluZyAke3NhdmFibGVUYWJzLmxlbmd0aH0gdGFicy5gKTtcclxuICAgICAgICAgICAgICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLnNldCh7IHNhdmVkVGFiczogc2F2YWJsZVRhYnMgfSk7XHJcbiAgICAgICAgICAgICAgICAvLyBVcGRhdGluZyB0aGlzIHZhbHVlIGFsc28gdXBkYXRlcyB0aGUgYmFkZ2UuXHJcbiAgICAgICAgICAgICAgICBHbG9iYWxTdGF0ZS50YWJzID0gc2F2YWJsZVRhYnM7XHJcbiAgICAgICAgICAgICAgICAvLyBPcGVuIC8gaGlnaGxpZ2h0IHByZXZpZXcgd2luZG93IGJlZm9yZSBjbG9zaW5nIHNhdmFibGVUYWJzLlxyXG4gICAgICAgICAgICAgICAgdGhpcy5vcGVuUHJldmlld1dpbmRvdygpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jbG9zZUFsbFRhYnMoc2F2YWJsZVRhYnMubWFwKHRhYiA9PiB0YWIuaWQpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdObyB0YWJzIHRvIHNhdmUsIGRvaW5nIG5vdGhpbmcuJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMub3BlblByZXZpZXdXaW5kb3cgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIGNocm9tZS50YWJzLmNyZWF0ZSh7IHVybDogY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKCdwcmV2aWV3Lmh0bWwnKSwgYWN0aXZlOiB0cnVlIH0sICh7IGlkIH0pID0+ICh0aGlzLmxvY2FsU3RhdGUucHJldmlld1RhYklkID0gaWQpKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMuY2xvc2VQcmV2aWV3V2luZG93ID0gKCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5sb2NhbFN0YXRlLnByZXZpZXdUYWJJZCkge1xyXG4gICAgICAgICAgICAgICAgY2hyb21lLnRhYnMucmVtb3ZlKHRoaXMubG9jYWxTdGF0ZS5wcmV2aWV3VGFiSWQpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5sb2NhbFN0YXRlLnByZXZpZXdUYWJJZCA9IG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMuY2xvc2VBbGxUYWJzID0gKGlkcykgPT4ge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgQ2xvc2luZyAke2lkcy5sZW5ndGh9IHRhYnMuYCk7XHJcbiAgICAgICAgICAgIGNocm9tZS50YWJzLnJlbW92ZShpZHMpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5yZXN0b3JlQWxsVGFicyA9ICh0YWJzKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBSZXN0b3JpbmcgJHt0YWJzLmxlbmd0aH0gdGFicy5gKTtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIHRhYnMuZm9yRWFjaCgoeyB1cmwsIGFjdGl2ZSB9KSA9PiBjaHJvbWUudGFicy5jcmVhdGUoeyB1cmwsIGFjdGl2ZSB9KSk7XHJcbiAgICAgICAgICAgICAgICAvLyBJZiBzdWNjZXNzZnVsbHkgcmVzdG9yZWQgKHdpdGhvdXQgdGhyb3dpbmcgZXJyb3IpIHJlbW92ZSBmcm9tIHN0b3JhZ2VcclxuICAgICAgICAgICAgICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLnNldCh7IHNhdmVkVGFiczogW10gfSk7XHJcbiAgICAgICAgICAgICAgICBHbG9iYWxTdGF0ZS50YWJzID0gW107XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5oYW5kbGVCdG5DbGljayA9ICgpID0+IHtcclxuICAgICAgICAgICAgY2hyb21lLnN0b3JhZ2UubG9jYWwuZ2V0KFsnc2F2ZWRUYWJzJ10sIChzdG9yYWdlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvLyBJZiB0aGVyZSBhcmUgdGFicyBzYXZlZCwgcmVzdG9yZSB0aGVtLiBPdGhlcndpc2Ugc2F2ZSBhbmQgY2xvc2UgdGhlIGN1cnJlbnQgdGFicy5cclxuICAgICAgICAgICAgICAgIGlmIChzdG9yYWdlLnNhdmVkVGFicyAmJiBzdG9yYWdlLnNhdmVkVGFicy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlc3RvcmVBbGxUYWJzKHN0b3JhZ2Uuc2F2ZWRUYWJzKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNsb3NlUHJldmlld1dpbmRvdygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hyb21lLnRhYnMucXVlcnkoeyBjdXJyZW50V2luZG93OiB0cnVlIH0sIHRoaXMuc2F2ZUFuZENsb3NlVGFicyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgdXBkYXRlQmFkZ2UodGFicykge1xyXG4gICAgICAgIC8vIE9uIHVwZGF0ZSBvZiB2YWx1ZSwgaWYgdGhlcmUgYXJlIHRhYnMsIHNldCB0aGUgdG9vbHRpcCB0byBhIHByZXZpZXcgb2YgdGhlIGRvbWFpbnMuXHJcbiAgICAgICAgaWYgKHRhYnMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBjb25zdCBkb21haW5zID0gdGFicy5tYXAodGFiID0+IHRhYi51cmwuc3BsaXQoJy8vJylbMV0uc3BsaXQoJy8nKVswXSk7XHJcbiAgICAgICAgICAgIGxldCBkb21haW5EaXNwbGF5ID0gYCR7dGFicy5sZW5ndGh9IHRhYnMgY3VycmVudGx5IHNhdmVkOlxcbmA7XHJcbiAgICAgICAgICAgIC8vIERpc3BsYXkgdGhlIGZpcnN0IDUgZG9tYWlucyBpbiB0aGUgdG9vbHRpcC5cclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCAoZG9tYWlucy5sZW5ndGggPiA1ID8gNSA6IGRvbWFpbnMubGVuZ3RoKTsgKytpKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBJZiB3ZSdyZSBvbiB0aGUgbGFzdCBvbmUsIGRvbid0IGRpc3BsYXkgdGhlIGNvbW1hLlxyXG4gICAgICAgICAgICAgICAgZG9tYWluRGlzcGxheSArPSBpID09PSAoZG9tYWlucy5sZW5ndGggPiA1ID8gNCA6IGRvbWFpbnMubGVuZ3RoIC0gMSkgPyBgJHtkb21haW5zW2ldfVxcbmAgOiBgJHtkb21haW5zW2ldfSxcXG5gO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChkb21haW5zLmxlbmd0aCA+IDUpXHJcbiAgICAgICAgICAgICAgICBkb21haW5EaXNwbGF5ICs9IGBhbmQgJHtkb21haW5zLmxlbmd0aCAtIDV9IG1vcmUuYDtcclxuICAgICAgICAgICAgY2hyb21lLmJyb3dzZXJBY3Rpb24uc2V0QmFkZ2VUZXh0KHsgdGV4dDogdGFicy5sZW5ndGgudG9TdHJpbmcoKSB9KTtcclxuICAgICAgICAgICAgY2hyb21lLmJyb3dzZXJBY3Rpb24uc2V0VGl0bGUoeyB0aXRsZTogZG9tYWluRGlzcGxheSB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGNocm9tZS5icm93c2VyQWN0aW9uLnNldEJhZGdlVGV4dCh7IHRleHQ6ICcnIH0pO1xyXG4gICAgICAgICAgICBjaHJvbWUuYnJvd3NlckFjdGlvbi5zZXRUaXRsZSh7IHRpdGxlOiBgQ2xpY2sgbWUgdG8gc2F2ZSB5b3VyIHRhYnMhYCB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuY2xhc3MgTWVzc2FnZUhhbmRsZXIge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy50YWJJZCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5zZW5kUmVzcG9uc2UgPSAoZGF0YSkgPT4ge1xyXG4gICAgICAgICAgICBjaHJvbWUudGFicy5zZW5kTWVzc2FnZSh0aGlzLnRhYklkLCBkYXRhKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMub25NZXNzYWdlID0gKHsgdHlwZSB9LCBzZW5kZXIpID0+IHtcclxuICAgICAgICAgICAgdGhpcy50YWJJZCA9IHNlbmRlci50YWIuaWQ7XHJcbiAgICAgICAgICAgIHN3aXRjaCAodHlwZSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnZ2V0VGFicyc6XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFHbG9iYWxTdGF0ZS50YWJzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdUYWJzIHJlcXVlc3RlZCBidXQgbm9uZSBpbiBnbG9iYWwgc3RhdGU/Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2VuZFJlc3BvbnNlKHsgc3RhdHVzOiAnZmFpbHVyZScsIGRhdGE6IFtdIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VuZFJlc3BvbnNlKHsgc3RhdHVzOiAnc3VjY2VzcycsIGRhdGE6IEdsb2JhbFN0YXRlLnRhYnMgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYEludmFsaWQgcmVxdWVzdCB0eXBlIHNlbnQgdG8gYmFja2dyb3VuZCBzY3JpcHQ6ICR7dHlwZX1gKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn1cclxuY29uc3QgTWVzc2FnZUhhbmRsZXJSZWYgPSBuZXcgTWVzc2FnZUhhbmRsZXIoKTtcclxuY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKE1lc3NhZ2VIYW5kbGVyUmVmLm9uTWVzc2FnZSk7XHJcbmNvbnN0IEJ0bkhhbmRsZXJSZWYgPSBuZXcgQnRuSGFuZGxlcigpO1xyXG4vLyBPbiBzdGFydHVwLCBjaGVjayBmb3IgdGFicyBpbiBzdG9yYWdlLiBJZiB0aGVyZSBhcmUgYW55LCB1cGRhdGUgc3RhdGUgYW5kIG9wZW4gd2luZG93LlxyXG5jaHJvbWUuc3RvcmFnZS5sb2NhbC5nZXQoWydzYXZlZFRhYnMnXSwgKHN0b3JhZ2UpID0+IHtcclxuICAgIGlmIChzdG9yYWdlLnNhdmVkVGFicyAmJiBzdG9yYWdlLnNhdmVkVGFicy5sZW5ndGgpIHtcclxuICAgICAgICBHbG9iYWxTdGF0ZS50YWJzID0gc3RvcmFnZS5zYXZlZFRhYnM7XHJcbiAgICAgICAgQnRuSGFuZGxlclJlZi5vcGVuUHJldmlld1dpbmRvdygpO1xyXG4gICAgfVxyXG59KTtcclxuY29uc3QgZGVib3VuY2VkQ2xpY2tIYW5kbGVyID0gaGVscGVyc18xLmRlYm91bmNlKDIwMCwgQnRuSGFuZGxlclJlZi5oYW5kbGVCdG5DbGljayk7XHJcbmNocm9tZS5icm93c2VyQWN0aW9uLm9uQ2xpY2tlZC5hZGRMaXN0ZW5lcihkZWJvdW5jZWRDbGlja0hhbmRsZXIpO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG5leHBvcnRzLmRlYm91bmNlID0gKGRlbGF5LCBmbikgPT4ge1xyXG4gICAgbGV0IHRpbWVySWQ7XHJcbiAgICByZXR1cm4gKC4uLmFyZ3MpID0+IHtcclxuICAgICAgICBpZiAodGltZXJJZClcclxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVySWQpO1xyXG4gICAgICAgIHRpbWVySWQgPSBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgZm4oLi4uYXJncyk7XHJcbiAgICAgICAgICAgIHRpbWVySWQgPSBudWxsO1xyXG4gICAgICAgIH0sIGRlbGF5KTtcclxuICAgIH07XHJcbn07XHJcbiJdLCJzb3VyY2VSb290IjoiIn0=