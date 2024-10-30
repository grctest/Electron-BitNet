/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/lib/applicationMenu.js":
/*!************************************!*\
  !*** ./src/lib/applicationMenu.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   initApplicationMenu: () => (/* binding */ initApplicationMenu)
/* harmony export */ });
/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! electron */ "electron");
/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(electron__WEBPACK_IMPORTED_MODULE_0__);


/**
 * For configuring the electron window menu
 */
function initApplicationMenu(mainWindow) {
    const template = [
      {
        label: 'View',
        submenu: [
          {
            label: 'Send to tray',
            click() {
              mainWindow.minimize();
            }
          },
          { label: 'Reload', role: 'reload' },
          { label: 'Dev tools', role: 'toggleDevTools' }
        ]
      }
    ];
    const menu = electron__WEBPACK_IMPORTED_MODULE_0__.Menu.buildFromTemplate(template);
    electron__WEBPACK_IMPORTED_MODULE_0__.Menu.setApplicationMenu(menu);
}


/***/ }),

/***/ "electron":
/*!***************************!*\
  !*** external "electron" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("electron");

/***/ }),

/***/ "express":
/*!**************************!*\
  !*** external "express" ***!
  \**************************/
/***/ ((module) => {

module.exports = require("express");

/***/ }),

/***/ "child_process":
/*!********************************!*\
  !*** external "child_process" ***!
  \********************************/
/***/ ((module) => {

module.exports = require("child_process");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

module.exports = require("fs");

/***/ }),

/***/ "os":
/*!*********************!*\
  !*** external "os" ***!
  \*********************/
/***/ ((module) => {

module.exports = require("os");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("path");

/***/ }),

/***/ "process":
/*!**************************!*\
  !*** external "process" ***!
  \**************************/
/***/ ((module) => {

module.exports = require("process");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/***/ ((module) => {

module.exports = require("url");

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
/*!***************************!*\
  !*** ./src/background.js ***!
  \***************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var child_process__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! child_process */ "child_process");
/* harmony import */ var child_process__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(child_process__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! path */ "path");
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(path__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var os__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! os */ "os");
/* harmony import */ var os__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(os__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var process__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! process */ "process");
/* harmony import */ var process__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(process__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! fs */ "fs");
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(fs__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var url__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! url */ "url");
/* harmony import */ var url__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(url__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! express */ "express");
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! electron */ "electron");
/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(electron__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var _lib_applicationMenu_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./lib/applicationMenu.js */ "./src/lib/applicationMenu.js");












let mainWindow = null;
let tray = null;
let inferenceProcess = null;

function runInference(args) {
  let mainPath = path__WEBPACK_IMPORTED_MODULE_1___default().join(electron__WEBPACK_IMPORTED_MODULE_7__.app.getAppPath(), 'bin', 'Release', 'llama-cli.exe');

  if (!fs__WEBPACK_IMPORTED_MODULE_4___default().existsSync(mainPath)) {
    mainPath = path__WEBPACK_IMPORTED_MODULE_1___default().join(electron__WEBPACK_IMPORTED_MODULE_7__.app.getAppPath(), 'bin', 'llama-cli');
  }

  const command = [
    `"${mainPath}"`,
    '-m', args.model,
    '-n', args.n_predict,
    '-t', args.threads,
    '-p', `"${args.prompt}"`,
    '-ngl', '0',
    '-c', args.ctx_size,
    '--temp', args.temperature,
    '-b', '1'
  ];

  inferenceProcess = (0,child_process__WEBPACK_IMPORTED_MODULE_0__.spawn)(command[0], command.slice(1), { shell: true });

  inferenceProcess.stdout.on('data', (data) => {
    const chars = data.toString();
    mainWindow.webContents.send('aiResponse', chars);
  });

  inferenceProcess.on('close', (code) => {
    mainWindow.webContents.send('aiComplete');
    inferenceProcess = null;
  });
}

function signalHandler() {
  if (inferenceProcess) {
    console.log('Terminating inference process...');
    try {
      inferenceProcess.kill('SIGKILL'); // Use SIGKILL to forcefully terminate the process
      inferenceProcess.stdout.removeAllListeners('data');
      inferenceProcess.stderr.removeAllListeners('data');
      inferenceProcess = null;
      console.log('Inference process terminated.');
    } catch (error) {
      console.error('Failed to terminate inference process:', error);
    }
  } else {
    console.log('No inference process to terminate.');
  }

  mainWindow.webContents.send('aiComplete');
  inferenceProcess = null;
}

const createWindow = async () => {
  mainWindow = new electron__WEBPACK_IMPORTED_MODULE_7__.BrowserWindow({
    minWidth: 480,
    minHeight: 695,
    maximizable: true,
    useContentSize: true,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      preload: path__WEBPACK_IMPORTED_MODULE_1___default().join(__dirname, "preload.js"),
    },
    icon: __dirname + "/img/taskbar.png",
  });

  const expressApp = express__WEBPACK_IMPORTED_MODULE_6___default()();

  let astroDistPath;
  if (true) {
    astroDistPath = "astroDist";
  } else {}

  expressApp.use(express__WEBPACK_IMPORTED_MODULE_6___default()["static"](astroDistPath));
  expressApp.listen(8080, () => {
    console.log("Express server listening on port 8080");
  });

  (0,_lib_applicationMenu_js__WEBPACK_IMPORTED_MODULE_8__.initApplicationMenu)(mainWindow);

  mainWindow.loadURL("http://localhost:8080/index.html");

  mainWindow.webContents.setWindowOpenHandler(() => {
    return { action: "deny" };
  });

  tray = new electron__WEBPACK_IMPORTED_MODULE_7__.Tray(path__WEBPACK_IMPORTED_MODULE_1___default().join(__dirname, "img", "tray.png"));
  const contextMenu = electron__WEBPACK_IMPORTED_MODULE_7__.Menu.buildFromTemplate([
    {
      label: "Show App",
      click: function () {
        mainWindow?.show();
      },
    },
    {
      label: "Quit",
      click: function () {
        tray = null;
        electron__WEBPACK_IMPORTED_MODULE_7__.app.quit();
      },
    },
  ]);

  tray.setToolTip("Electron BitNet");

  tray.on("right-click", (event, bounds) => {
    tray?.popUpContextMenu(contextMenu);
  });

  const safeDomains = [
    "https://github.com",
    "https://react.dev/",
    "https://astro.build/",
    "https://www.electronjs.org/"
  ];

  electron__WEBPACK_IMPORTED_MODULE_7__.ipcMain.on("openURL", (event, arg) => {
    try {
      const parsedUrl = new (url__WEBPACK_IMPORTED_MODULE_5___default().URL)(arg);
      const domain = parsedUrl.hostname;

      const isSafeDomain = safeDomains.some((safeDomain) => {
        const safeDomainHostname = new (url__WEBPACK_IMPORTED_MODULE_5___default().URL)(safeDomain).hostname;
        return safeDomainHostname === domain;
      });

      if (isSafeDomain) {
        electron__WEBPACK_IMPORTED_MODULE_7__.shell.openExternal(arg);
      } else {
        console.error(`Rejected opening URL with unsafe domain: ${domain}`);
      }
    } catch (err) {
      console.error(`Failed to open URL: ${err.message}`);
    }
  });

  electron__WEBPACK_IMPORTED_MODULE_7__.ipcMain.on("runInference", (event, arg) => {
    runInference(arg);
  });

  electron__WEBPACK_IMPORTED_MODULE_7__.ipcMain.on("stopInference", (event) => {
    signalHandler();
  });

  electron__WEBPACK_IMPORTED_MODULE_7__.ipcMain.handle('openFileDialog', async () => {
    const result = await electron__WEBPACK_IMPORTED_MODULE_7__.dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: 'GGUF Files', extensions: ['gguf'] }]
    });
    return result.filePaths;
  });

  tray.on("click", () => {
    mainWindow?.setAlwaysOnTop(true);
    mainWindow?.show();
    mainWindow?.focus();
    mainWindow?.setAlwaysOnTop(false);
  });

  tray.on("balloon-click", () => {
    mainWindow?.setAlwaysOnTop(true);
    mainWindow?.show();
    mainWindow?.focus();
    mainWindow?.setAlwaysOnTop(false);
  });
};

const currentOS = os__WEBPACK_IMPORTED_MODULE_2___default().platform();
if (currentOS === "win32" || currentOS === "linux") {
  // windows + linux setup phase
  const gotTheLock = electron__WEBPACK_IMPORTED_MODULE_7__.app.requestSingleInstanceLock();

  if (!gotTheLock) {
    electron__WEBPACK_IMPORTED_MODULE_7__.app.quit();
  }

  electron__WEBPACK_IMPORTED_MODULE_7__.app.whenReady().then(() => {
    createWindow();
  });
} else {
  electron__WEBPACK_IMPORTED_MODULE_7__.app.whenReady().then(() => {
    createWindow();
  });

  electron__WEBPACK_IMPORTED_MODULE_7__.app.on('before-quit', (event) => {
    signalHandler();
  });
  
  electron__WEBPACK_IMPORTED_MODULE_7__.app.on('will-quit', (event) => {
    signalHandler();
  });

  electron__WEBPACK_IMPORTED_MODULE_7__.app.on("window-all-closed", () => {
    if ((process__WEBPACK_IMPORTED_MODULE_3___default().platform) !== "darwin") {
      electron__WEBPACK_IMPORTED_MODULE_7__.app.quit();
    }
  });

  electron__WEBPACK_IMPORTED_MODULE_7__.app.on("activate", () => {
    if (mainWindow === null) {
      createWindow();
    }
  });
}
})();

/******/ })()
;
//# sourceMappingURL=background.js.map