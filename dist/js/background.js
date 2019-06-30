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
const State = {
    previewTabId: null,
};
function saveTabs(tabs) {
    // Filter out un-savable tabs
    const savableTabs = tabs.filter(tab => (tab.url && tab.title && !tab.incognito ? true : false));
    if (savableTabs.length) {
        console.log(`Saving ${savableTabs.length} tabs.`);
        chrome.storage.local.set({ savedTabs: savableTabs });
        // Open / highlight preview window before closing savableTabs.
        handlePreviewWindow({ action: 'open' });
        closeTabs(savableTabs.map(tab => tab.id));
    }
    else {
        console.log('No tabs to save.');
    }
}
function handlePreviewWindow({ action }) {
    switch (action) {
        case 'open':
            chrome.tabs.create({ url: chrome.runtime.getURL('preview.html'), active: true }, ({ id }) => (State.previewTabId = id));
        case 'close':
            if (State.previewTabId) {
                chrome.tabs.remove(State.previewTabId);
            }
    }
}
function closeTabs(ids) {
    console.log(`Closing ${ids.length} tabs`);
    chrome.tabs.remove(ids);
}
function restoreTabs(tabs) {
    try {
        console.log(`Restoring ${tabs.length} tabs.`);
        tabs.forEach(({ url, active }) => chrome.tabs.create({ url, active }));
        // Remove them after successful restoring.
        chrome.storage.local.set({ savedTabs: [] });
    }
    catch (err) {
        // If failed to restore, don't remove them from the storage.
        console.error(err);
    }
}
function onBtnClick() {
    chrome.storage.local.get(['savedTabs'], (storage) => {
        // If there are savedTabs, restore them. Otherwise save current tabs.
        if (storage.savedTabs && storage.savedTabs.length) {
            restoreTabs(storage.savedTabs);
            handlePreviewWindow({ action: 'close' });
        }
        else {
            chrome.tabs.query({ currentWindow: true }, saveTabs);
        }
    });
}
function onMessage(msg) {
    console.log(msg);
}
const debouncedOnBtnClick = helpers_1.debounce(200, onBtnClick);
chrome.runtime.onMessage.addListener(onMessage);
chrome.browserAction.onClicked.addListener(debouncedOnBtnClick);


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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL3R5cGVzY3JpcHQvYmFja2dyb3VuZC50cyIsIndlYnBhY2s6Ly8vLi9zcmMvdHlwZXNjcmlwdC9oZWxwZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGtEQUEwQyxnQ0FBZ0M7QUFDMUU7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxnRUFBd0Qsa0JBQWtCO0FBQzFFO0FBQ0EseURBQWlELGNBQWM7QUFDL0Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlEQUF5QyxpQ0FBaUM7QUFDMUUsd0hBQWdILG1CQUFtQixFQUFFO0FBQ3JJO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsbUNBQTJCLDBCQUEwQixFQUFFO0FBQ3ZELHlDQUFpQyxlQUFlO0FBQ2hEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhEQUFzRCwrREFBK0Q7O0FBRXJIO0FBQ0E7OztBQUdBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7QUNsRmE7QUFDYiw4Q0FBOEMsY0FBYztBQUM1RCxrQkFBa0IsbUJBQU8sQ0FBQyw4Q0FBVztBQUNyQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw4QkFBOEIsbUJBQW1CO0FBQ2pELGtDQUFrQyx5QkFBeUI7QUFDM0Q7QUFDQSw2QkFBNkIsaUJBQWlCO0FBQzlDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDhCQUE4QixTQUFTO0FBQ3ZDO0FBQ0E7QUFDQSxnQ0FBZ0MsMkRBQTJELElBQUksS0FBSztBQUNwRztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJCQUEyQixXQUFXO0FBQ3RDO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUNBQWlDLFlBQVk7QUFDN0MsdUJBQXVCLGNBQWMseUJBQXlCLGNBQWM7QUFDNUU7QUFDQSxrQ0FBa0MsZ0JBQWdCO0FBQ2xEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQ0FBaUMsa0JBQWtCO0FBQ25EO0FBQ0E7QUFDQSwrQkFBK0Isc0JBQXNCO0FBQ3JEO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7O0FDcEVhO0FBQ2IsOENBQThDLGNBQWM7QUFDNUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBIiwiZmlsZSI6ImJhY2tncm91bmQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBnZXR0ZXIgfSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiBcdFx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG4gXHRcdH1cbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbiBcdH07XG5cbiBcdC8vIGNyZWF0ZSBhIGZha2UgbmFtZXNwYWNlIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDE6IHZhbHVlIGlzIGEgbW9kdWxlIGlkLCByZXF1aXJlIGl0XG4gXHQvLyBtb2RlICYgMjogbWVyZ2UgYWxsIHByb3BlcnRpZXMgb2YgdmFsdWUgaW50byB0aGUgbnNcbiBcdC8vIG1vZGUgJiA0OiByZXR1cm4gdmFsdWUgd2hlbiBhbHJlYWR5IG5zIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDh8MTogYmVoYXZlIGxpa2UgcmVxdWlyZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy50ID0gZnVuY3Rpb24odmFsdWUsIG1vZGUpIHtcbiBcdFx0aWYobW9kZSAmIDEpIHZhbHVlID0gX193ZWJwYWNrX3JlcXVpcmVfXyh2YWx1ZSk7XG4gXHRcdGlmKG1vZGUgJiA4KSByZXR1cm4gdmFsdWU7XG4gXHRcdGlmKChtb2RlICYgNCkgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAmJiB2YWx1ZS5fX2VzTW9kdWxlKSByZXR1cm4gdmFsdWU7XG4gXHRcdHZhciBucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18ucihucyk7XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShucywgJ2RlZmF1bHQnLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2YWx1ZSB9KTtcbiBcdFx0aWYobW9kZSAmIDIgJiYgdHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSBmb3IodmFyIGtleSBpbiB2YWx1ZSkgX193ZWJwYWNrX3JlcXVpcmVfXy5kKG5zLCBrZXksIGZ1bmN0aW9uKGtleSkgeyByZXR1cm4gdmFsdWVba2V5XTsgfS5iaW5kKG51bGwsIGtleSkpO1xuIFx0XHRyZXR1cm4gbnM7XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gXCIuL3NyYy90eXBlc2NyaXB0L2JhY2tncm91bmQudHNcIik7XG4iLCJcInVzZSBzdHJpY3RcIjtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG5jb25zdCBoZWxwZXJzXzEgPSByZXF1aXJlKFwiLi9oZWxwZXJzXCIpO1xyXG4vLyBPbiBidXR0b24gY2xpY2ssIGNoZWNrIGlmIHRoZXJlIGFyZSBzYXZlZFRhYnMuXHJcbi8vICBJZiB5ZXMsIG9wZW4gdGhlbVxyXG4vLyAgSWYgbm8sIGNoZWNrIGlmIHRoZXJlIGFyZSBvcGVuIHRhYnMgYmVzaWRlcyBuZXd0YWJcclxuLy8gICAgSWYgeWVzLCBzYXZlIHRoZW0sIGNsb3NlIHRoZW0sIG9wZW4gcHJldmlldyBwYWdlLlxyXG4vLyAgICBJZiBubywgaWdub3JlXHJcbmNvbnN0IFN0YXRlID0ge1xyXG4gICAgcHJldmlld1RhYklkOiBudWxsLFxyXG59O1xyXG5mdW5jdGlvbiBzYXZlVGFicyh0YWJzKSB7XHJcbiAgICAvLyBGaWx0ZXIgb3V0IHVuLXNhdmFibGUgdGFic1xyXG4gICAgY29uc3Qgc2F2YWJsZVRhYnMgPSB0YWJzLmZpbHRlcih0YWIgPT4gKHRhYi51cmwgJiYgdGFiLnRpdGxlICYmICF0YWIuaW5jb2duaXRvID8gdHJ1ZSA6IGZhbHNlKSk7XHJcbiAgICBpZiAoc2F2YWJsZVRhYnMubGVuZ3RoKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coYFNhdmluZyAke3NhdmFibGVUYWJzLmxlbmd0aH0gdGFicy5gKTtcclxuICAgICAgICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5zZXQoeyBzYXZlZFRhYnM6IHNhdmFibGVUYWJzIH0pO1xyXG4gICAgICAgIC8vIE9wZW4gLyBoaWdobGlnaHQgcHJldmlldyB3aW5kb3cgYmVmb3JlIGNsb3Npbmcgc2F2YWJsZVRhYnMuXHJcbiAgICAgICAgaGFuZGxlUHJldmlld1dpbmRvdyh7IGFjdGlvbjogJ29wZW4nIH0pO1xyXG4gICAgICAgIGNsb3NlVGFicyhzYXZhYmxlVGFicy5tYXAodGFiID0+IHRhYi5pZCkpO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ05vIHRhYnMgdG8gc2F2ZS4nKTtcclxuICAgIH1cclxufVxyXG5mdW5jdGlvbiBoYW5kbGVQcmV2aWV3V2luZG93KHsgYWN0aW9uIH0pIHtcclxuICAgIHN3aXRjaCAoYWN0aW9uKSB7XHJcbiAgICAgICAgY2FzZSAnb3Blbic6XHJcbiAgICAgICAgICAgIGNocm9tZS50YWJzLmNyZWF0ZSh7IHVybDogY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKCdwcmV2aWV3Lmh0bWwnKSwgYWN0aXZlOiB0cnVlIH0sICh7IGlkIH0pID0+IChTdGF0ZS5wcmV2aWV3VGFiSWQgPSBpZCkpO1xyXG4gICAgICAgIGNhc2UgJ2Nsb3NlJzpcclxuICAgICAgICAgICAgaWYgKFN0YXRlLnByZXZpZXdUYWJJZCkge1xyXG4gICAgICAgICAgICAgICAgY2hyb21lLnRhYnMucmVtb3ZlKFN0YXRlLnByZXZpZXdUYWJJZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgIH1cclxufVxyXG5mdW5jdGlvbiBjbG9zZVRhYnMoaWRzKSB7XHJcbiAgICBjb25zb2xlLmxvZyhgQ2xvc2luZyAke2lkcy5sZW5ndGh9IHRhYnNgKTtcclxuICAgIGNocm9tZS50YWJzLnJlbW92ZShpZHMpO1xyXG59XHJcbmZ1bmN0aW9uIHJlc3RvcmVUYWJzKHRhYnMpIHtcclxuICAgIHRyeSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coYFJlc3RvcmluZyAke3RhYnMubGVuZ3RofSB0YWJzLmApO1xyXG4gICAgICAgIHRhYnMuZm9yRWFjaCgoeyB1cmwsIGFjdGl2ZSB9KSA9PiBjaHJvbWUudGFicy5jcmVhdGUoeyB1cmwsIGFjdGl2ZSB9KSk7XHJcbiAgICAgICAgLy8gUmVtb3ZlIHRoZW0gYWZ0ZXIgc3VjY2Vzc2Z1bCByZXN0b3JpbmcuXHJcbiAgICAgICAgY2hyb21lLnN0b3JhZ2UubG9jYWwuc2V0KHsgc2F2ZWRUYWJzOiBbXSB9KTtcclxuICAgIH1cclxuICAgIGNhdGNoIChlcnIpIHtcclxuICAgICAgICAvLyBJZiBmYWlsZWQgdG8gcmVzdG9yZSwgZG9uJ3QgcmVtb3ZlIHRoZW0gZnJvbSB0aGUgc3RvcmFnZS5cclxuICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XHJcbiAgICB9XHJcbn1cclxuZnVuY3Rpb24gb25CdG5DbGljaygpIHtcclxuICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldChbJ3NhdmVkVGFicyddLCAoc3RvcmFnZSkgPT4ge1xyXG4gICAgICAgIC8vIElmIHRoZXJlIGFyZSBzYXZlZFRhYnMsIHJlc3RvcmUgdGhlbS4gT3RoZXJ3aXNlIHNhdmUgY3VycmVudCB0YWJzLlxyXG4gICAgICAgIGlmIChzdG9yYWdlLnNhdmVkVGFicyAmJiBzdG9yYWdlLnNhdmVkVGFicy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgcmVzdG9yZVRhYnMoc3RvcmFnZS5zYXZlZFRhYnMpO1xyXG4gICAgICAgICAgICBoYW5kbGVQcmV2aWV3V2luZG93KHsgYWN0aW9uOiAnY2xvc2UnIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgY2hyb21lLnRhYnMucXVlcnkoeyBjdXJyZW50V2luZG93OiB0cnVlIH0sIHNhdmVUYWJzKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxufVxyXG5mdW5jdGlvbiBvbk1lc3NhZ2UobXNnKSB7XHJcbiAgICBjb25zb2xlLmxvZyhtc2cpO1xyXG59XHJcbmNvbnN0IGRlYm91bmNlZE9uQnRuQ2xpY2sgPSBoZWxwZXJzXzEuZGVib3VuY2UoMjAwLCBvbkJ0bkNsaWNrKTtcclxuY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKG9uTWVzc2FnZSk7XHJcbmNocm9tZS5icm93c2VyQWN0aW9uLm9uQ2xpY2tlZC5hZGRMaXN0ZW5lcihkZWJvdW5jZWRPbkJ0bkNsaWNrKTtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxuZXhwb3J0cy5kZWJvdW5jZSA9IChkZWxheSwgZm4pID0+IHtcclxuICAgIGxldCB0aW1lcklkO1xyXG4gICAgcmV0dXJuICguLi5hcmdzKSA9PiB7XHJcbiAgICAgICAgaWYgKHRpbWVySWQpXHJcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lcklkKTtcclxuICAgICAgICB0aW1lcklkID0gc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgIGZuKC4uLmFyZ3MpO1xyXG4gICAgICAgICAgICB0aW1lcklkID0gbnVsbDtcclxuICAgICAgICB9LCBkZWxheSk7XHJcbiAgICB9O1xyXG59O1xyXG4iXSwic291cmNlUm9vdCI6IiJ9