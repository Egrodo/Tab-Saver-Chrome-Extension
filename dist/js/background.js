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
const GlobalState = {
    tabs: [],
};
class BtnHandler {
    constructor() {
        this.localState = {
            previewTabId: null,
        };
        this.updateBadgeCount = (count) => {
            if (count > 0) {
                chrome.browserAction.setBadgeText({ text: count.toString() });
                chrome.browserAction.setTitle({ title: `${count} tabs currently saved.` });
            }
            else {
                chrome.browserAction.setBadgeText({ text: '' });
                chrome.browserAction.setTitle({ title: `Click to save your tabs!` });
            }
        };
        this.saveAndCloseTabs = (tabs) => {
            // Filter out un-savable tabs
            const savableTabs = tabs.filter(tab => (tab.url && tab.title && !tab.incognito ? true : false));
            if (savableTabs.length) {
                console.log(`Saving ${savableTabs.length} tabs.`);
                chrome.storage.local.set({ savedTabs: savableTabs });
                GlobalState.tabs = savableTabs;
                // Open / highlight preview window before closing savableTabs.
                this.openPreviewWindow();
                this.closeAllTabs(savableTabs.map(tab => tab.id));
                this.updateBadgeCount(savableTabs.length);
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
                this.updateBadgeCount(0);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL3R5cGVzY3JpcHQvYmFja2dyb3VuZC50cyIsIndlYnBhY2s6Ly8vLi9zcmMvdHlwZXNjcmlwdC9oZWxwZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGtEQUEwQyxnQ0FBZ0M7QUFDMUU7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxnRUFBd0Qsa0JBQWtCO0FBQzFFO0FBQ0EseURBQWlELGNBQWM7QUFDL0Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlEQUF5QyxpQ0FBaUM7QUFDMUUsd0hBQWdILG1CQUFtQixFQUFFO0FBQ3JJO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsbUNBQTJCLDBCQUEwQixFQUFFO0FBQ3ZELHlDQUFpQyxlQUFlO0FBQ2hEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhEQUFzRCwrREFBK0Q7O0FBRXJIO0FBQ0E7OztBQUdBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7QUNsRmE7QUFDYiw4Q0FBOEMsY0FBYztBQUM1RCxrQkFBa0IsbUJBQU8sQ0FBQyw4Q0FBVztBQUNyQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtREFBbUQseUJBQXlCO0FBQzVFLCtDQUErQyxXQUFXLE1BQU0seUJBQXlCO0FBQ3pGO0FBQ0E7QUFDQSxtREFBbUQsV0FBVztBQUM5RCwrQ0FBK0Msb0NBQW9DO0FBQ25GO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNDQUFzQyxtQkFBbUI7QUFDekQsMENBQTBDLHlCQUF5QjtBQUNuRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0NBQWdDLDJEQUEyRCxJQUFJLEtBQUs7QUFDcEc7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1DQUFtQyxXQUFXO0FBQzlDO0FBQ0E7QUFDQTtBQUNBLHFDQUFxQyxZQUFZO0FBQ2pEO0FBQ0EsK0JBQStCLGNBQWMseUJBQXlCLGNBQWM7QUFDcEY7QUFDQSwwQ0FBMEMsZ0JBQWdCO0FBQzFEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHVDQUF1QyxzQkFBc0I7QUFDN0Q7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkJBQTJCLE9BQU87QUFDbEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJDQUEyQyw4QkFBOEI7QUFDekU7QUFDQTtBQUNBLHVDQUF1Qyw0Q0FBNEM7QUFDbkY7QUFDQTtBQUNBLHFGQUFxRixLQUFLO0FBQzFGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7OztBQzdHYTtBQUNiLDhDQUE4QyxjQUFjO0FBQzVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQSIsImZpbGUiOiJiYWNrZ3JvdW5kLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZ2V0dGVyIH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSBmdW5jdGlvbihleHBvcnRzKSB7XG4gXHRcdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuIFx0XHR9XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG4gXHR9O1xuXG4gXHQvLyBjcmVhdGUgYSBmYWtlIG5hbWVzcGFjZSBvYmplY3RcbiBcdC8vIG1vZGUgJiAxOiB2YWx1ZSBpcyBhIG1vZHVsZSBpZCwgcmVxdWlyZSBpdFxuIFx0Ly8gbW9kZSAmIDI6IG1lcmdlIGFsbCBwcm9wZXJ0aWVzIG9mIHZhbHVlIGludG8gdGhlIG5zXG4gXHQvLyBtb2RlICYgNDogcmV0dXJuIHZhbHVlIHdoZW4gYWxyZWFkeSBucyBvYmplY3RcbiBcdC8vIG1vZGUgJiA4fDE6IGJlaGF2ZSBsaWtlIHJlcXVpcmVcbiBcdF9fd2VicGFja19yZXF1aXJlX18udCA9IGZ1bmN0aW9uKHZhbHVlLCBtb2RlKSB7XG4gXHRcdGlmKG1vZGUgJiAxKSB2YWx1ZSA9IF9fd2VicGFja19yZXF1aXJlX18odmFsdWUpO1xuIFx0XHRpZihtb2RlICYgOCkgcmV0dXJuIHZhbHVlO1xuIFx0XHRpZigobW9kZSAmIDQpICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgJiYgdmFsdWUuX19lc01vZHVsZSkgcmV0dXJuIHZhbHVlO1xuIFx0XHR2YXIgbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIobnMpO1xuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkobnMsICdkZWZhdWx0JywgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdmFsdWUgfSk7XG4gXHRcdGlmKG1vZGUgJiAyICYmIHR5cGVvZiB2YWx1ZSAhPSAnc3RyaW5nJykgZm9yKHZhciBrZXkgaW4gdmFsdWUpIF9fd2VicGFja19yZXF1aXJlX18uZChucywga2V5LCBmdW5jdGlvbihrZXkpIHsgcmV0dXJuIHZhbHVlW2tleV07IH0uYmluZChudWxsLCBrZXkpKTtcbiBcdFx0cmV0dXJuIG5zO1xuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IFwiLi9zcmMvdHlwZXNjcmlwdC9iYWNrZ3JvdW5kLnRzXCIpO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxuY29uc3QgaGVscGVyc18xID0gcmVxdWlyZShcIi4vaGVscGVyc1wiKTtcclxuLy8gT24gYnV0dG9uIGNsaWNrLCBjaGVjayBpZiB0aGVyZSBhcmUgc2F2ZWRUYWJzLlxyXG4vLyAgSWYgeWVzLCBvcGVuIHRoZW1cclxuLy8gIElmIG5vLCBjaGVjayBpZiB0aGVyZSBhcmUgb3BlbiB0YWJzIGJlc2lkZXMgbmV3dGFiXHJcbi8vICAgIElmIHllcywgc2F2ZSB0aGVtLCBjbG9zZSB0aGVtLCBvcGVuIHByZXZpZXcgcGFnZS5cclxuLy8gICAgSWYgbm8sIGlnbm9yZVxyXG5jb25zdCBHbG9iYWxTdGF0ZSA9IHtcclxuICAgIHRhYnM6IFtdLFxyXG59O1xyXG5jbGFzcyBCdG5IYW5kbGVyIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMubG9jYWxTdGF0ZSA9IHtcclxuICAgICAgICAgICAgcHJldmlld1RhYklkOiBudWxsLFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy51cGRhdGVCYWRnZUNvdW50ID0gKGNvdW50KSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChjb3VudCA+IDApIHtcclxuICAgICAgICAgICAgICAgIGNocm9tZS5icm93c2VyQWN0aW9uLnNldEJhZGdlVGV4dCh7IHRleHQ6IGNvdW50LnRvU3RyaW5nKCkgfSk7XHJcbiAgICAgICAgICAgICAgICBjaHJvbWUuYnJvd3NlckFjdGlvbi5zZXRUaXRsZSh7IHRpdGxlOiBgJHtjb3VudH0gdGFicyBjdXJyZW50bHkgc2F2ZWQuYCB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNocm9tZS5icm93c2VyQWN0aW9uLnNldEJhZGdlVGV4dCh7IHRleHQ6ICcnIH0pO1xyXG4gICAgICAgICAgICAgICAgY2hyb21lLmJyb3dzZXJBY3Rpb24uc2V0VGl0bGUoeyB0aXRsZTogYENsaWNrIHRvIHNhdmUgeW91ciB0YWJzIWAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMuc2F2ZUFuZENsb3NlVGFicyA9ICh0YWJzKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIEZpbHRlciBvdXQgdW4tc2F2YWJsZSB0YWJzXHJcbiAgICAgICAgICAgIGNvbnN0IHNhdmFibGVUYWJzID0gdGFicy5maWx0ZXIodGFiID0+ICh0YWIudXJsICYmIHRhYi50aXRsZSAmJiAhdGFiLmluY29nbml0byA/IHRydWUgOiBmYWxzZSkpO1xyXG4gICAgICAgICAgICBpZiAoc2F2YWJsZVRhYnMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgU2F2aW5nICR7c2F2YWJsZVRhYnMubGVuZ3RofSB0YWJzLmApO1xyXG4gICAgICAgICAgICAgICAgY2hyb21lLnN0b3JhZ2UubG9jYWwuc2V0KHsgc2F2ZWRUYWJzOiBzYXZhYmxlVGFicyB9KTtcclxuICAgICAgICAgICAgICAgIEdsb2JhbFN0YXRlLnRhYnMgPSBzYXZhYmxlVGFicztcclxuICAgICAgICAgICAgICAgIC8vIE9wZW4gLyBoaWdobGlnaHQgcHJldmlldyB3aW5kb3cgYmVmb3JlIGNsb3Npbmcgc2F2YWJsZVRhYnMuXHJcbiAgICAgICAgICAgICAgICB0aGlzLm9wZW5QcmV2aWV3V2luZG93KCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNsb3NlQWxsVGFicyhzYXZhYmxlVGFicy5tYXAodGFiID0+IHRhYi5pZCkpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVCYWRnZUNvdW50KHNhdmFibGVUYWJzLmxlbmd0aCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnTm8gdGFicyB0byBzYXZlLCBkb2luZyBub3RoaW5nLicpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLm9wZW5QcmV2aWV3V2luZG93ID0gKCkgPT4ge1xyXG4gICAgICAgICAgICBjaHJvbWUudGFicy5jcmVhdGUoeyB1cmw6IGNocm9tZS5ydW50aW1lLmdldFVSTCgncHJldmlldy5odG1sJyksIGFjdGl2ZTogdHJ1ZSB9LCAoeyBpZCB9KSA9PiAodGhpcy5sb2NhbFN0YXRlLnByZXZpZXdUYWJJZCA9IGlkKSk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLmNsb3NlUHJldmlld1dpbmRvdyA9ICgpID0+IHtcclxuICAgICAgICAgICAgaWYgKHRoaXMubG9jYWxTdGF0ZS5wcmV2aWV3VGFiSWQpIHtcclxuICAgICAgICAgICAgICAgIGNocm9tZS50YWJzLnJlbW92ZSh0aGlzLmxvY2FsU3RhdGUucHJldmlld1RhYklkKTtcclxuICAgICAgICAgICAgICAgIHRoaXMubG9jYWxTdGF0ZS5wcmV2aWV3VGFiSWQgPSBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLmNsb3NlQWxsVGFicyA9IChpZHMpID0+IHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coYENsb3NpbmcgJHtpZHMubGVuZ3RofSB0YWJzLmApO1xyXG4gICAgICAgICAgICBjaHJvbWUudGFicy5yZW1vdmUoaWRzKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMucmVzdG9yZUFsbFRhYnMgPSAodGFicykgPT4ge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgUmVzdG9yaW5nICR7dGFicy5sZW5ndGh9IHRhYnMuYCk7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICB0YWJzLmZvckVhY2goKHsgdXJsLCBhY3RpdmUgfSkgPT4gY2hyb21lLnRhYnMuY3JlYXRlKHsgdXJsLCBhY3RpdmUgfSkpO1xyXG4gICAgICAgICAgICAgICAgLy8gSWYgc3VjY2Vzc2Z1bGx5IHJlc3RvcmVkICh3aXRob3V0IHRocm93aW5nIGVycm9yKSByZW1vdmUgZnJvbSBzdG9yYWdlXHJcbiAgICAgICAgICAgICAgICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5zZXQoeyBzYXZlZFRhYnM6IFtdIH0pO1xyXG4gICAgICAgICAgICAgICAgR2xvYmFsU3RhdGUudGFicyA9IFtdO1xyXG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVCYWRnZUNvdW50KDApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMuaGFuZGxlQnRuQ2xpY2sgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldChbJ3NhdmVkVGFicyddLCAoc3RvcmFnZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy8gSWYgdGhlcmUgYXJlIHRhYnMgc2F2ZWQsIHJlc3RvcmUgdGhlbS4gT3RoZXJ3aXNlIHNhdmUgYW5kIGNsb3NlIHRoZSBjdXJyZW50IHRhYnMuXHJcbiAgICAgICAgICAgICAgICBpZiAoc3RvcmFnZS5zYXZlZFRhYnMgJiYgc3RvcmFnZS5zYXZlZFRhYnMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZXN0b3JlQWxsVGFicyhzdG9yYWdlLnNhdmVkVGFicyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jbG9zZVByZXZpZXdXaW5kb3coKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGNocm9tZS50YWJzLnF1ZXJ5KHsgY3VycmVudFdpbmRvdzogdHJ1ZSB9LCB0aGlzLnNhdmVBbmRDbG9zZVRhYnMpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59XHJcbmNsYXNzIE1lc3NhZ2VIYW5kbGVyIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMudGFiSWQgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuc2VuZFJlc3BvbnNlID0gKGRhdGEpID0+IHtcclxuICAgICAgICAgICAgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UodGhpcy50YWJJZCwgZGF0YSk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLm9uTWVzc2FnZSA9ICh7IHR5cGUgfSwgc2VuZGVyKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMudGFiSWQgPSBzZW5kZXIudGFiLmlkO1xyXG4gICAgICAgICAgICBzd2l0Y2ggKHR5cGUpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2dldFRhYnMnOlxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghR2xvYmFsU3RhdGUudGFicy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignVGFicyByZXF1ZXN0ZWQgYnV0IG5vbmUgaW4gZ2xvYmFsIHN0YXRlPycpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbmRSZXNwb25zZSh7IHN0YXR1czogJ2ZhaWx1cmUnLCBkYXRhOiBbXSB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbmRSZXNwb25zZSh7IHN0YXR1czogJ3N1Y2Nlc3MnLCBkYXRhOiBHbG9iYWxTdGF0ZS50YWJzIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBJbnZhbGlkIHJlcXVlc3QgdHlwZSBzZW50IHRvIGJhY2tncm91bmQgc2NyaXB0OiAke3R5cGV9YCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59XHJcbmNvbnN0IE1lc3NhZ2VIYW5kbGVyUmVmID0gbmV3IE1lc3NhZ2VIYW5kbGVyKCk7XHJcbmNocm9tZS5ydW50aW1lLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcihNZXNzYWdlSGFuZGxlclJlZi5vbk1lc3NhZ2UpO1xyXG5jb25zdCBCdG5IYW5kbGVyUmVmID0gbmV3IEJ0bkhhbmRsZXIoKTtcclxuY29uc3QgZGVib3VuY2VkQ2xpY2tIYW5kbGVyID0gaGVscGVyc18xLmRlYm91bmNlKDIwMCwgQnRuSGFuZGxlclJlZi5oYW5kbGVCdG5DbGljayk7XHJcbmNocm9tZS5icm93c2VyQWN0aW9uLm9uQ2xpY2tlZC5hZGRMaXN0ZW5lcihkZWJvdW5jZWRDbGlja0hhbmRsZXIpO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG5leHBvcnRzLmRlYm91bmNlID0gKGRlbGF5LCBmbikgPT4ge1xyXG4gICAgbGV0IHRpbWVySWQ7XHJcbiAgICByZXR1cm4gKC4uLmFyZ3MpID0+IHtcclxuICAgICAgICBpZiAodGltZXJJZClcclxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVySWQpO1xyXG4gICAgICAgIHRpbWVySWQgPSBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgZm4oLi4uYXJncyk7XHJcbiAgICAgICAgICAgIHRpbWVySWQgPSBudWxsO1xyXG4gICAgICAgIH0sIGRlbGF5KTtcclxuICAgIH07XHJcbn07XHJcbiJdLCJzb3VyY2VSb290IjoiIn0=