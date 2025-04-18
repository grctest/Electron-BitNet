/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "electron":
/*!***************************!*\
  !*** external "electron" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("electron");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!************************!*\
  !*** ./src/preload.js ***!
  \************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! electron */ "electron");
/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(electron__WEBPACK_IMPORTED_MODULE_0__);


electron__WEBPACK_IMPORTED_MODULE_0__.contextBridge.exposeInMainWorld("electron", {
  openURL: async (target) => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.send("openURL", target),
  openFileDialog: async () => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.invoke("openFileDialog"),
  getMaxThreads: async () => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.invoke("getMaxThreads"),
  //
  onAiResponse: (func) => {
    electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.on("aiResponse", (event, data) => {
      func(data);
    });
  },
  onAiError: (func) => {
    electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.on("aiError", (event) => {
      func();
    });
  },
  onAiComplete: (func) => {
    electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.on("aiComplete", (event) => {
      func();
    });
  },
  runInference: async (args) => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.send("runInference", args),
  stopInference: async (args) => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.send("stopInference", args),
  //
  onBenchmarkLog: (func) => {
    electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.on("benchmarkLog", (event, data) => {
      func(data);
    });
  },
  onBenchmarkComplete: (func) => {
    electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.on("benchmarkComplete", (event) => {
      func();
    });
  },
  runBenchmark: async (args) => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.send("runBenchmark", args),
  stopBenchmark: async (args) => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.send("stopBenchmark", args),
  //
  onPerplexityLog: (func) => {
    electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.on("perplexityLog", (event, data) => {
      func(data);
    });
  },
  onPerplexityComplete: (func) => {
    electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.on("perplexityComplete", (event) => {
      func();
    });
  },
  runPerplexity: async (args) => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.send("runPerplexity", args),
  stopPerplexity: async (args) => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.send("stopPerplexity", args),
});

})();

/******/ })()
;
//# sourceMappingURL=preload.js.map