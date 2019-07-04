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
            chrome.browserAction.setTitle({ title: `Click to save your tabs!` });
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
// TODO: On startup open the preview page if there are tabs saved
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL3R5cGVzY3JpcHQvYmFja2dyb3VuZC50cyIsIndlYnBhY2s6Ly8vLi9zcmMvdHlwZXNjcmlwdC9oZWxwZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGtEQUEwQyxnQ0FBZ0M7QUFDMUU7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxnRUFBd0Qsa0JBQWtCO0FBQzFFO0FBQ0EseURBQWlELGNBQWM7QUFDL0Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlEQUF5QyxpQ0FBaUM7QUFDMUUsd0hBQWdILG1CQUFtQixFQUFFO0FBQ3JJO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsbUNBQTJCLDBCQUEwQixFQUFFO0FBQ3ZELHlDQUFpQyxlQUFlO0FBQ2hEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhEQUFzRCwrREFBK0Q7O0FBRXJIO0FBQ0E7OztBQUdBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7QUNsRmE7QUFDYiw4Q0FBOEMsY0FBYztBQUM1RCxrQkFBa0IsbUJBQU8sQ0FBQyw4Q0FBVztBQUNyQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLEtBQUs7QUFDTCxDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0NBQXNDLG1CQUFtQjtBQUN6RCwwQ0FBMEMseUJBQXlCO0FBQ25FO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQ0FBZ0MsMkRBQTJELElBQUksS0FBSztBQUNwRztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUNBQW1DLFdBQVc7QUFDOUM7QUFDQTtBQUNBO0FBQ0EscUNBQXFDLFlBQVk7QUFDakQ7QUFDQSwrQkFBK0IsY0FBYyx5QkFBeUIsY0FBYztBQUNwRjtBQUNBLDBDQUEwQyxnQkFBZ0I7QUFDMUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHVDQUF1QyxzQkFBc0I7QUFDN0Q7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUNBQW1DLFlBQVk7QUFDL0M7QUFDQSwyQkFBMkIsK0NBQStDO0FBQzFFO0FBQ0EsMEZBQTBGLFdBQVcsU0FBUyxXQUFXO0FBQ3pIO0FBQ0E7QUFDQSx3Q0FBd0MsbUJBQW1CO0FBQzNELCtDQUErQywrQkFBK0I7QUFDOUUsMkNBQTJDLHVCQUF1QjtBQUNsRTtBQUNBO0FBQ0EsK0NBQStDLFdBQVc7QUFDMUQsMkNBQTJDLG9DQUFvQztBQUMvRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyQkFBMkIsT0FBTztBQUNsQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkNBQTJDLDhCQUE4QjtBQUN6RTtBQUNBO0FBQ0EsdUNBQXVDLDRDQUE0QztBQUNuRjtBQUNBO0FBQ0EscUZBQXFGLEtBQUs7QUFDMUY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7QUMvSGE7QUFDYiw4Q0FBOEMsY0FBYztBQUM1RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0EiLCJmaWxlIjoiYmFja2dyb3VuZC5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGdldHRlciB9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yID0gZnVuY3Rpb24oZXhwb3J0cykge1xuIFx0XHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcbiBcdFx0fVxuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuIFx0fTtcblxuIFx0Ly8gY3JlYXRlIGEgZmFrZSBuYW1lc3BhY2Ugb2JqZWN0XG4gXHQvLyBtb2RlICYgMTogdmFsdWUgaXMgYSBtb2R1bGUgaWQsIHJlcXVpcmUgaXRcbiBcdC8vIG1vZGUgJiAyOiBtZXJnZSBhbGwgcHJvcGVydGllcyBvZiB2YWx1ZSBpbnRvIHRoZSBuc1xuIFx0Ly8gbW9kZSAmIDQ6IHJldHVybiB2YWx1ZSB3aGVuIGFscmVhZHkgbnMgb2JqZWN0XG4gXHQvLyBtb2RlICYgOHwxOiBiZWhhdmUgbGlrZSByZXF1aXJlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnQgPSBmdW5jdGlvbih2YWx1ZSwgbW9kZSkge1xuIFx0XHRpZihtb2RlICYgMSkgdmFsdWUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKHZhbHVlKTtcbiBcdFx0aWYobW9kZSAmIDgpIHJldHVybiB2YWx1ZTtcbiBcdFx0aWYoKG1vZGUgJiA0KSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICYmIHZhbHVlLl9fZXNNb2R1bGUpIHJldHVybiB2YWx1ZTtcbiBcdFx0dmFyIG5zID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yKG5zKTtcbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG5zLCAnZGVmYXVsdCcsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHZhbHVlIH0pO1xuIFx0XHRpZihtb2RlICYgMiAmJiB0eXBlb2YgdmFsdWUgIT0gJ3N0cmluZycpIGZvcih2YXIga2V5IGluIHZhbHVlKSBfX3dlYnBhY2tfcmVxdWlyZV9fLmQobnMsIGtleSwgZnVuY3Rpb24oa2V5KSB7IHJldHVybiB2YWx1ZVtrZXldOyB9LmJpbmQobnVsbCwga2V5KSk7XG4gXHRcdHJldHVybiBucztcbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vc3JjL3R5cGVzY3JpcHQvYmFja2dyb3VuZC50c1wiKTtcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbmNvbnN0IGhlbHBlcnNfMSA9IHJlcXVpcmUoXCIuL2hlbHBlcnNcIik7XHJcbi8vIE9uIGJ1dHRvbiBjbGljaywgY2hlY2sgaWYgdGhlcmUgYXJlIHNhdmVkVGFicy5cclxuLy8gIElmIHllcywgb3BlbiB0aGVtXHJcbi8vICBJZiBubywgY2hlY2sgaWYgdGhlcmUgYXJlIG9wZW4gdGFicyBiZXNpZGVzIG5ld3RhYlxyXG4vLyAgICBJZiB5ZXMsIHNhdmUgdGhlbSwgY2xvc2UgdGhlbSwgb3BlbiBwcmV2aWV3IHBhZ2UuXHJcbi8vICAgIElmIG5vLCBpZ25vcmVcclxuY29uc3QgR2xvYmFsU3RhdGUgPSB7IHRhYnM6IFtdIH07XHJcbi8vIE9uIGNoYW5nZSBvZlxyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoR2xvYmFsU3RhdGUsICd0YWJzJywge1xyXG4gICAgc2V0KHRhYnMpIHtcclxuICAgICAgICB0aGlzLnZhbHVlID0gdGFicztcclxuICAgICAgICBCdG5IYW5kbGVyLnVwZGF0ZUJhZGdlKHRhYnMpO1xyXG4gICAgfSxcclxuICAgIGdldCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy52YWx1ZTtcclxuICAgIH0sXHJcbn0pO1xyXG5jbGFzcyBCdG5IYW5kbGVyIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMubG9jYWxTdGF0ZSA9IHtcclxuICAgICAgICAgICAgcHJldmlld1RhYklkOiBudWxsLFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5zYXZlQW5kQ2xvc2VUYWJzID0gKHRhYnMpID0+IHtcclxuICAgICAgICAgICAgLy8gRmlsdGVyIG91dCB1bi1zYXZhYmxlIHRhYnNcclxuICAgICAgICAgICAgY29uc3Qgc2F2YWJsZVRhYnMgPSB0YWJzLmZpbHRlcih0YWIgPT4gKHRhYi51cmwgJiYgdGFiLnRpdGxlICYmICF0YWIuaW5jb2duaXRvID8gdHJ1ZSA6IGZhbHNlKSk7XHJcbiAgICAgICAgICAgIGlmIChzYXZhYmxlVGFicy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBTYXZpbmcgJHtzYXZhYmxlVGFicy5sZW5ndGh9IHRhYnMuYCk7XHJcbiAgICAgICAgICAgICAgICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5zZXQoeyBzYXZlZFRhYnM6IHNhdmFibGVUYWJzIH0pO1xyXG4gICAgICAgICAgICAgICAgLy8gVXBkYXRpbmcgdGhpcyB2YWx1ZSBhbHNvIHVwZGF0ZXMgdGhlIGJhZGdlLlxyXG4gICAgICAgICAgICAgICAgR2xvYmFsU3RhdGUudGFicyA9IHNhdmFibGVUYWJzO1xyXG4gICAgICAgICAgICAgICAgLy8gT3BlbiAvIGhpZ2hsaWdodCBwcmV2aWV3IHdpbmRvdyBiZWZvcmUgY2xvc2luZyBzYXZhYmxlVGFicy5cclxuICAgICAgICAgICAgICAgIHRoaXMub3BlblByZXZpZXdXaW5kb3coKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2xvc2VBbGxUYWJzKHNhdmFibGVUYWJzLm1hcCh0YWIgPT4gdGFiLmlkKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnTm8gdGFicyB0byBzYXZlLCBkb2luZyBub3RoaW5nLicpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLm9wZW5QcmV2aWV3V2luZG93ID0gKCkgPT4ge1xyXG4gICAgICAgICAgICBjaHJvbWUudGFicy5jcmVhdGUoeyB1cmw6IGNocm9tZS5ydW50aW1lLmdldFVSTCgncHJldmlldy5odG1sJyksIGFjdGl2ZTogdHJ1ZSB9LCAoeyBpZCB9KSA9PiAodGhpcy5sb2NhbFN0YXRlLnByZXZpZXdUYWJJZCA9IGlkKSk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLmNsb3NlUHJldmlld1dpbmRvdyA9ICgpID0+IHtcclxuICAgICAgICAgICAgaWYgKHRoaXMubG9jYWxTdGF0ZS5wcmV2aWV3VGFiSWQpIHtcclxuICAgICAgICAgICAgICAgIGNocm9tZS50YWJzLnJlbW92ZSh0aGlzLmxvY2FsU3RhdGUucHJldmlld1RhYklkKTtcclxuICAgICAgICAgICAgICAgIHRoaXMubG9jYWxTdGF0ZS5wcmV2aWV3VGFiSWQgPSBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLmNsb3NlQWxsVGFicyA9IChpZHMpID0+IHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coYENsb3NpbmcgJHtpZHMubGVuZ3RofSB0YWJzLmApO1xyXG4gICAgICAgICAgICBjaHJvbWUudGFicy5yZW1vdmUoaWRzKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMucmVzdG9yZUFsbFRhYnMgPSAodGFicykgPT4ge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgUmVzdG9yaW5nICR7dGFicy5sZW5ndGh9IHRhYnMuYCk7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICB0YWJzLmZvckVhY2goKHsgdXJsLCBhY3RpdmUgfSkgPT4gY2hyb21lLnRhYnMuY3JlYXRlKHsgdXJsLCBhY3RpdmUgfSkpO1xyXG4gICAgICAgICAgICAgICAgLy8gSWYgc3VjY2Vzc2Z1bGx5IHJlc3RvcmVkICh3aXRob3V0IHRocm93aW5nIGVycm9yKSByZW1vdmUgZnJvbSBzdG9yYWdlXHJcbiAgICAgICAgICAgICAgICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5zZXQoeyBzYXZlZFRhYnM6IFtdIH0pO1xyXG4gICAgICAgICAgICAgICAgR2xvYmFsU3RhdGUudGFicyA9IFtdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMuaGFuZGxlQnRuQ2xpY2sgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldChbJ3NhdmVkVGFicyddLCAoc3RvcmFnZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy8gSWYgdGhlcmUgYXJlIHRhYnMgc2F2ZWQsIHJlc3RvcmUgdGhlbS4gT3RoZXJ3aXNlIHNhdmUgYW5kIGNsb3NlIHRoZSBjdXJyZW50IHRhYnMuXHJcbiAgICAgICAgICAgICAgICBpZiAoc3RvcmFnZS5zYXZlZFRhYnMgJiYgc3RvcmFnZS5zYXZlZFRhYnMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZXN0b3JlQWxsVGFicyhzdG9yYWdlLnNhdmVkVGFicyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jbG9zZVByZXZpZXdXaW5kb3coKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGNocm9tZS50YWJzLnF1ZXJ5KHsgY3VycmVudFdpbmRvdzogdHJ1ZSB9LCB0aGlzLnNhdmVBbmRDbG9zZVRhYnMpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG4gICAgc3RhdGljIHVwZGF0ZUJhZGdlKHRhYnMpIHtcclxuICAgICAgICAvLyBPbiB1cGRhdGUgb2YgdmFsdWUsIGlmIHRoZXJlIGFyZSB0YWJzLCBzZXQgdGhlIHRvb2x0aXAgdG8gYSBwcmV2aWV3IG9mIHRoZSBkb21haW5zLlxyXG4gICAgICAgIGlmICh0YWJzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgY29uc3QgZG9tYWlucyA9IHRhYnMubWFwKHRhYiA9PiB0YWIudXJsLnNwbGl0KCcvLycpWzFdLnNwbGl0KCcvJylbMF0pO1xyXG4gICAgICAgICAgICBsZXQgZG9tYWluRGlzcGxheSA9IGAke3RhYnMubGVuZ3RofSB0YWJzIGN1cnJlbnRseSBzYXZlZDpcXG5gO1xyXG4gICAgICAgICAgICAvLyBEaXNwbGF5IHRoZSBmaXJzdCA1IGRvbWFpbnMgaW4gdGhlIHRvb2x0aXAuXHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgKGRvbWFpbnMubGVuZ3RoID4gNSA/IDUgOiBkb21haW5zLmxlbmd0aCk7ICsraSkge1xyXG4gICAgICAgICAgICAgICAgLy8gSWYgd2UncmUgb24gdGhlIGxhc3Qgb25lLCBkb24ndCBkaXNwbGF5IHRoZSBjb21tYS5cclxuICAgICAgICAgICAgICAgIGRvbWFpbkRpc3BsYXkgKz0gaSA9PT0gKGRvbWFpbnMubGVuZ3RoID4gNSA/IDQgOiBkb21haW5zLmxlbmd0aCAtIDEpID8gYCR7ZG9tYWluc1tpXX1cXG5gIDogYCR7ZG9tYWluc1tpXX0sXFxuYDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoZG9tYWlucy5sZW5ndGggPiA1KVxyXG4gICAgICAgICAgICAgICAgZG9tYWluRGlzcGxheSArPSBgYW5kICR7ZG9tYWlucy5sZW5ndGggLSA1fSBtb3JlLmA7XHJcbiAgICAgICAgICAgIGNocm9tZS5icm93c2VyQWN0aW9uLnNldEJhZGdlVGV4dCh7IHRleHQ6IHRhYnMubGVuZ3RoLnRvU3RyaW5nKCkgfSk7XHJcbiAgICAgICAgICAgIGNocm9tZS5icm93c2VyQWN0aW9uLnNldFRpdGxlKHsgdGl0bGU6IGRvbWFpbkRpc3BsYXkgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBjaHJvbWUuYnJvd3NlckFjdGlvbi5zZXRCYWRnZVRleHQoeyB0ZXh0OiAnJyB9KTtcclxuICAgICAgICAgICAgY2hyb21lLmJyb3dzZXJBY3Rpb24uc2V0VGl0bGUoeyB0aXRsZTogYENsaWNrIHRvIHNhdmUgeW91ciB0YWJzIWAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbmNsYXNzIE1lc3NhZ2VIYW5kbGVyIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMudGFiSWQgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuc2VuZFJlc3BvbnNlID0gKGRhdGEpID0+IHtcclxuICAgICAgICAgICAgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UodGhpcy50YWJJZCwgZGF0YSk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLm9uTWVzc2FnZSA9ICh7IHR5cGUgfSwgc2VuZGVyKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMudGFiSWQgPSBzZW5kZXIudGFiLmlkO1xyXG4gICAgICAgICAgICBzd2l0Y2ggKHR5cGUpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2dldFRhYnMnOlxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghR2xvYmFsU3RhdGUudGFicy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignVGFicyByZXF1ZXN0ZWQgYnV0IG5vbmUgaW4gZ2xvYmFsIHN0YXRlPycpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbmRSZXNwb25zZSh7IHN0YXR1czogJ2ZhaWx1cmUnLCBkYXRhOiBbXSB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbmRSZXNwb25zZSh7IHN0YXR1czogJ3N1Y2Nlc3MnLCBkYXRhOiBHbG9iYWxTdGF0ZS50YWJzIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBJbnZhbGlkIHJlcXVlc3QgdHlwZSBzZW50IHRvIGJhY2tncm91bmQgc2NyaXB0OiAke3R5cGV9YCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59XHJcbmNvbnN0IE1lc3NhZ2VIYW5kbGVyUmVmID0gbmV3IE1lc3NhZ2VIYW5kbGVyKCk7XHJcbmNocm9tZS5ydW50aW1lLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcihNZXNzYWdlSGFuZGxlclJlZi5vbk1lc3NhZ2UpO1xyXG5jb25zdCBCdG5IYW5kbGVyUmVmID0gbmV3IEJ0bkhhbmRsZXIoKTtcclxuLy8gVE9ETzogT24gc3RhcnR1cCBvcGVuIHRoZSBwcmV2aWV3IHBhZ2UgaWYgdGhlcmUgYXJlIHRhYnMgc2F2ZWRcclxuY29uc3QgZGVib3VuY2VkQ2xpY2tIYW5kbGVyID0gaGVscGVyc18xLmRlYm91bmNlKDIwMCwgQnRuSGFuZGxlclJlZi5oYW5kbGVCdG5DbGljayk7XHJcbmNocm9tZS5icm93c2VyQWN0aW9uLm9uQ2xpY2tlZC5hZGRMaXN0ZW5lcihkZWJvdW5jZWRDbGlja0hhbmRsZXIpO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG5leHBvcnRzLmRlYm91bmNlID0gKGRlbGF5LCBmbikgPT4ge1xyXG4gICAgbGV0IHRpbWVySWQ7XHJcbiAgICByZXR1cm4gKC4uLmFyZ3MpID0+IHtcclxuICAgICAgICBpZiAodGltZXJJZClcclxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVySWQpO1xyXG4gICAgICAgIHRpbWVySWQgPSBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgZm4oLi4uYXJncyk7XHJcbiAgICAgICAgICAgIHRpbWVySWQgPSBudWxsO1xyXG4gICAgICAgIH0sIGRlbGF5KTtcclxuICAgIH07XHJcbn07XHJcbiJdLCJzb3VyY2VSb290IjoiIn0=