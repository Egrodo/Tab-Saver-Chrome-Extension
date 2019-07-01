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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL3R5cGVzY3JpcHQvYmFja2dyb3VuZC50cyIsIndlYnBhY2s6Ly8vLi9zcmMvdHlwZXNjcmlwdC9oZWxwZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGtEQUEwQyxnQ0FBZ0M7QUFDMUU7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxnRUFBd0Qsa0JBQWtCO0FBQzFFO0FBQ0EseURBQWlELGNBQWM7QUFDL0Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlEQUF5QyxpQ0FBaUM7QUFDMUUsd0hBQWdILG1CQUFtQixFQUFFO0FBQ3JJO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsbUNBQTJCLDBCQUEwQixFQUFFO0FBQ3ZELHlDQUFpQyxlQUFlO0FBQ2hEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhEQUFzRCwrREFBK0Q7O0FBRXJIO0FBQ0E7OztBQUdBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7QUNsRmE7QUFDYiw4Q0FBOEMsY0FBYztBQUM1RCxrQkFBa0IsbUJBQU8sQ0FBQyw4Q0FBVztBQUNyQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0NBQXNDLG1CQUFtQjtBQUN6RCwwQ0FBMEMseUJBQXlCO0FBQ25FO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0NBQWdDLDJEQUEyRCxJQUFJLEtBQUs7QUFDcEc7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1DQUFtQyxXQUFXO0FBQzlDO0FBQ0E7QUFDQTtBQUNBLHFDQUFxQyxZQUFZO0FBQ2pEO0FBQ0EsK0JBQStCLGNBQWMseUJBQXlCLGNBQWM7QUFDcEY7QUFDQSwwQ0FBMEMsZ0JBQWdCO0FBQzFEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1Q0FBdUMsc0JBQXNCO0FBQzdEO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJCQUEyQixPQUFPO0FBQ2xDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyQ0FBMkMsOEJBQThCO0FBQ3pFO0FBQ0E7QUFDQSx1Q0FBdUMsNENBQTRDO0FBQ25GO0FBQ0E7QUFDQSxxRkFBcUYsS0FBSztBQUMxRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7QUNqR2E7QUFDYiw4Q0FBOEMsY0FBYztBQUM1RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0EiLCJmaWxlIjoiYmFja2dyb3VuZC5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGdldHRlciB9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yID0gZnVuY3Rpb24oZXhwb3J0cykge1xuIFx0XHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcbiBcdFx0fVxuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuIFx0fTtcblxuIFx0Ly8gY3JlYXRlIGEgZmFrZSBuYW1lc3BhY2Ugb2JqZWN0XG4gXHQvLyBtb2RlICYgMTogdmFsdWUgaXMgYSBtb2R1bGUgaWQsIHJlcXVpcmUgaXRcbiBcdC8vIG1vZGUgJiAyOiBtZXJnZSBhbGwgcHJvcGVydGllcyBvZiB2YWx1ZSBpbnRvIHRoZSBuc1xuIFx0Ly8gbW9kZSAmIDQ6IHJldHVybiB2YWx1ZSB3aGVuIGFscmVhZHkgbnMgb2JqZWN0XG4gXHQvLyBtb2RlICYgOHwxOiBiZWhhdmUgbGlrZSByZXF1aXJlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnQgPSBmdW5jdGlvbih2YWx1ZSwgbW9kZSkge1xuIFx0XHRpZihtb2RlICYgMSkgdmFsdWUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKHZhbHVlKTtcbiBcdFx0aWYobW9kZSAmIDgpIHJldHVybiB2YWx1ZTtcbiBcdFx0aWYoKG1vZGUgJiA0KSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICYmIHZhbHVlLl9fZXNNb2R1bGUpIHJldHVybiB2YWx1ZTtcbiBcdFx0dmFyIG5zID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yKG5zKTtcbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG5zLCAnZGVmYXVsdCcsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHZhbHVlIH0pO1xuIFx0XHRpZihtb2RlICYgMiAmJiB0eXBlb2YgdmFsdWUgIT0gJ3N0cmluZycpIGZvcih2YXIga2V5IGluIHZhbHVlKSBfX3dlYnBhY2tfcmVxdWlyZV9fLmQobnMsIGtleSwgZnVuY3Rpb24oa2V5KSB7IHJldHVybiB2YWx1ZVtrZXldOyB9LmJpbmQobnVsbCwga2V5KSk7XG4gXHRcdHJldHVybiBucztcbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vc3JjL3R5cGVzY3JpcHQvYmFja2dyb3VuZC50c1wiKTtcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbmNvbnN0IGhlbHBlcnNfMSA9IHJlcXVpcmUoXCIuL2hlbHBlcnNcIik7XHJcbi8vIE9uIGJ1dHRvbiBjbGljaywgY2hlY2sgaWYgdGhlcmUgYXJlIHNhdmVkVGFicy5cclxuLy8gIElmIHllcywgb3BlbiB0aGVtXHJcbi8vICBJZiBubywgY2hlY2sgaWYgdGhlcmUgYXJlIG9wZW4gdGFicyBiZXNpZGVzIG5ld3RhYlxyXG4vLyAgICBJZiB5ZXMsIHNhdmUgdGhlbSwgY2xvc2UgdGhlbSwgb3BlbiBwcmV2aWV3IHBhZ2UuXHJcbi8vICAgIElmIG5vLCBpZ25vcmVcclxuY29uc3QgR2xvYmFsU3RhdGUgPSB7XHJcbiAgICB0YWJzOiBbXSxcclxufTtcclxuY2xhc3MgQnRuSGFuZGxlciB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmxvY2FsU3RhdGUgPSB7XHJcbiAgICAgICAgICAgIHByZXZpZXdUYWJJZDogbnVsbCxcclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMuc2F2ZUFuZENsb3NlVGFicyA9ICh0YWJzKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIEZpbHRlciBvdXQgdW4tc2F2YWJsZSB0YWJzXHJcbiAgICAgICAgICAgIGNvbnN0IHNhdmFibGVUYWJzID0gdGFicy5maWx0ZXIodGFiID0+ICh0YWIudXJsICYmIHRhYi50aXRsZSAmJiAhdGFiLmluY29nbml0byA/IHRydWUgOiBmYWxzZSkpO1xyXG4gICAgICAgICAgICBpZiAoc2F2YWJsZVRhYnMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgU2F2aW5nICR7c2F2YWJsZVRhYnMubGVuZ3RofSB0YWJzLmApO1xyXG4gICAgICAgICAgICAgICAgY2hyb21lLnN0b3JhZ2UubG9jYWwuc2V0KHsgc2F2ZWRUYWJzOiBzYXZhYmxlVGFicyB9KTtcclxuICAgICAgICAgICAgICAgIEdsb2JhbFN0YXRlLnRhYnMgPSBzYXZhYmxlVGFicztcclxuICAgICAgICAgICAgICAgIC8vIE9wZW4gLyBoaWdobGlnaHQgcHJldmlldyB3aW5kb3cgYmVmb3JlIGNsb3Npbmcgc2F2YWJsZVRhYnMuXHJcbiAgICAgICAgICAgICAgICB0aGlzLm9wZW5QcmV2aWV3V2luZG93KCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNsb3NlQWxsVGFicyhzYXZhYmxlVGFicy5tYXAodGFiID0+IHRhYi5pZCkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ05vIHRhYnMgdG8gc2F2ZSwgZG9pbmcgbm90aGluZy4nKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5vcGVuUHJldmlld1dpbmRvdyA9ICgpID0+IHtcclxuICAgICAgICAgICAgY2hyb21lLnRhYnMuY3JlYXRlKHsgdXJsOiBjaHJvbWUucnVudGltZS5nZXRVUkwoJ3ByZXZpZXcuaHRtbCcpLCBhY3RpdmU6IHRydWUgfSwgKHsgaWQgfSkgPT4gKHRoaXMubG9jYWxTdGF0ZS5wcmV2aWV3VGFiSWQgPSBpZCkpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5jbG9zZVByZXZpZXdXaW5kb3cgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmxvY2FsU3RhdGUucHJldmlld1RhYklkKSB7XHJcbiAgICAgICAgICAgICAgICBjaHJvbWUudGFicy5yZW1vdmUodGhpcy5sb2NhbFN0YXRlLnByZXZpZXdUYWJJZCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxvY2FsU3RhdGUucHJldmlld1RhYklkID0gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5jbG9zZUFsbFRhYnMgPSAoaWRzKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBDbG9zaW5nICR7aWRzLmxlbmd0aH0gdGFicy5gKTtcclxuICAgICAgICAgICAgY2hyb21lLnRhYnMucmVtb3ZlKGlkcyk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLnJlc3RvcmVBbGxUYWJzID0gKHRhYnMpID0+IHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coYFJlc3RvcmluZyAke3RhYnMubGVuZ3RofSB0YWJzLmApO1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgdGFicy5mb3JFYWNoKCh7IHVybCwgYWN0aXZlIH0pID0+IGNocm9tZS50YWJzLmNyZWF0ZSh7IHVybCwgYWN0aXZlIH0pKTtcclxuICAgICAgICAgICAgICAgIC8vIElmIHN1Y2Nlc3NmdWxseSByZXN0b3JlZCAod2l0aG91dCB0aHJvd2luZyBlcnJvcikgcmVtb3ZlIGZyb20gc3RvcmFnZVxyXG4gICAgICAgICAgICAgICAgY2hyb21lLnN0b3JhZ2UubG9jYWwuc2V0KHsgc2F2ZWRUYWJzOiBbXSB9KTtcclxuICAgICAgICAgICAgICAgIEdsb2JhbFN0YXRlLnRhYnMgPSBbXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLmhhbmRsZUJ0bkNsaWNrID0gKCkgPT4ge1xyXG4gICAgICAgICAgICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5nZXQoWydzYXZlZFRhYnMnXSwgKHN0b3JhZ2UpID0+IHtcclxuICAgICAgICAgICAgICAgIC8vIElmIHRoZXJlIGFyZSB0YWJzIHNhdmVkLCByZXN0b3JlIHRoZW0uIE90aGVyd2lzZSBzYXZlIGFuZCBjbG9zZSB0aGUgY3VycmVudCB0YWJzLlxyXG4gICAgICAgICAgICAgICAgaWYgKHN0b3JhZ2Uuc2F2ZWRUYWJzICYmIHN0b3JhZ2Uuc2F2ZWRUYWJzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVzdG9yZUFsbFRhYnMoc3RvcmFnZS5zYXZlZFRhYnMpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2xvc2VQcmV2aWV3V2luZG93KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBjaHJvbWUudGFicy5xdWVyeSh7IGN1cnJlbnRXaW5kb3c6IHRydWUgfSwgdGhpcy5zYXZlQW5kQ2xvc2VUYWJzKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufVxyXG5jbGFzcyBNZXNzYWdlSGFuZGxlciB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLnRhYklkID0gbnVsbDtcclxuICAgICAgICB0aGlzLnNlbmRSZXNwb25zZSA9IChkYXRhKSA9PiB7XHJcbiAgICAgICAgICAgIGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKHRoaXMudGFiSWQsIGRhdGEpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5vbk1lc3NhZ2UgPSAoeyB0eXBlIH0sIHNlbmRlcikgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnRhYklkID0gc2VuZGVyLnRhYi5pZDtcclxuICAgICAgICAgICAgc3dpdGNoICh0eXBlKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdnZXRUYWJzJzpcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIUdsb2JhbFN0YXRlLnRhYnMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1RhYnMgcmVxdWVzdGVkIGJ1dCBub25lIGluIGdsb2JhbCBzdGF0ZT8nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZW5kUmVzcG9uc2UoeyBzdGF0dXM6ICdmYWlsdXJlJywgZGF0YTogW10gfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZW5kUmVzcG9uc2UoeyBzdGF0dXM6ICdzdWNjZXNzJywgZGF0YTogR2xvYmFsU3RhdGUudGFicyB9KTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgSW52YWxpZCByZXF1ZXN0IHR5cGUgc2VudCB0byBiYWNrZ3JvdW5kIHNjcmlwdDogJHt0eXBlfWApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufVxyXG5jb25zdCBNZXNzYWdlSGFuZGxlclJlZiA9IG5ldyBNZXNzYWdlSGFuZGxlcigpO1xyXG5jaHJvbWUucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoTWVzc2FnZUhhbmRsZXJSZWYub25NZXNzYWdlKTtcclxuY29uc3QgQnRuSGFuZGxlclJlZiA9IG5ldyBCdG5IYW5kbGVyKCk7XHJcbmNvbnN0IGRlYm91bmNlZENsaWNrSGFuZGxlciA9IGhlbHBlcnNfMS5kZWJvdW5jZSgyMDAsIEJ0bkhhbmRsZXJSZWYuaGFuZGxlQnRuQ2xpY2spO1xyXG5jaHJvbWUuYnJvd3NlckFjdGlvbi5vbkNsaWNrZWQuYWRkTGlzdGVuZXIoZGVib3VuY2VkQ2xpY2tIYW5kbGVyKTtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxuZXhwb3J0cy5kZWJvdW5jZSA9IChkZWxheSwgZm4pID0+IHtcclxuICAgIGxldCB0aW1lcklkO1xyXG4gICAgcmV0dXJuICguLi5hcmdzKSA9PiB7XHJcbiAgICAgICAgaWYgKHRpbWVySWQpXHJcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lcklkKTtcclxuICAgICAgICB0aW1lcklkID0gc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgIGZuKC4uLmFyZ3MpO1xyXG4gICAgICAgICAgICB0aW1lcklkID0gbnVsbDtcclxuICAgICAgICB9LCBkZWxheSk7XHJcbiAgICB9O1xyXG59O1xyXG4iXSwic291cmNlUm9vdCI6IiJ9