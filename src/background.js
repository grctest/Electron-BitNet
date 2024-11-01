import { spawn } from 'child_process';
import path from 'path';
import os from 'os';
import process from 'process';
import fs from 'fs';
import url from "url";
import express from "express";

import { app, BrowserWindow, Menu, Tray, ipcMain, shell, dialog } from "electron";

import { initApplicationMenu } from "./lib/applicationMenu.js";

let mainWindow = null;
let tray = null;
let inferenceProcess = null;
let benchmarkProcess = null;
let perplexityProcess = null;

function runInference(args) {
  let mainPath = path.join(app.getAppPath(), 'bin', 'Release', 'llama-cli.exe');

  if (!fs.existsSync(mainPath)) {
    return;
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

  inferenceProcess = spawn(command[0], command.slice(1), { shell: true });

  inferenceProcess.stdout.on('data', (data) => {
    const chars = data.toString();
    mainWindow.webContents.send('aiResponse', chars);
  });

  inferenceProcess.on('close', (code) => {
    mainWindow.webContents.send('aiComplete');
    inferenceProcess = null;
  });
}

function terminateInference() {
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

function runBenchmark(args) {
  let benchPath = path.join(app.getAppPath(), 'bin', 'Release', 'llama-bench.exe');

  if (!fs.existsSync(benchPath)) {
    console.error('Benchmark binary not found, please build first.');
    return;
  }

  const command = [
    `"${benchPath}"`,
    '-m', args.model,
    '-n', args.n_token,
    '-ngl', '0',
    '-b', '1',
    '-t', args.threads,
    '-p', args.n_prompt,
    '-r', '5'
  ];

  benchmarkProcess = spawn(command[0], command.slice(1), { shell: true });

  benchmarkProcess.stdout.on('data', (data) => {
    const log = data.toString();
    mainWindow.webContents.send('benchmarkLog', log);
  });

  benchmarkProcess.on('close', (code) => {
    mainWindow.webContents.send('benchmarkComplete');
    benchmarkProcess = null;
  });
}

function terminateBenchmark() {
  if (benchmarkProcess) {
    console.log('Terminating benchmark process...');
    try {
      benchmarkProcess.kill('SIGKILL'); // Use SIGKILL to forcefully terminate the process
      benchmarkProcess.stdout.removeAllListeners('data');
      benchmarkProcess.stderr.removeAllListeners('data');
      benchmarkProcess = null;
      console.log('Benchmark process terminated.');
    } catch (error) {
      console.error('Failed to terminate benchmark process:', error);
    }
  } else {
    console.log('No benchmark process to terminate.');
  }

  mainWindow.webContents.send('benchmarkComplete');
  benchmarkProcess = null;
}

function runPerplexity(args) {
  let perplexityPath = path.join(app.getAppPath(), 'bin', 'Release', 'llama-perplexity.exe');

  if (!fs.existsSync(perplexityPath)) {
    console.error('Perplexity binary not found, please build first.');
    return;
  }

  const command = [
    `"${perplexityPath}"`,
    '--model', `"${args.model}"`,
    '--prompt', `"${args.prompt}"`,
    '--threads', args.threads,
    '--ctx-size', args.ctx_size,
    '--perplexity',
    '--ppl-stride', args.ppl_stride
  ];

  perplexityProcess = spawn(command[0], command.slice(1), { shell: true });

  perplexityProcess.stderr.on('data', (data) => {
    const log = data.toString();
    mainWindow.webContents.send('perplexityLog', log);
  });

  perplexityProcess.on('error', (error) => {
    console.error('Perplexity process error:', error);
  });

  perplexityProcess.on('close', (code) => {
    mainWindow.webContents.send('perplexityComplete');
    perplexityProcess = null;
  });
}

function terminatePerplexity() {
  if (perplexityProcess) {
    console.log('Terminating perplexity process...');
    try {
      perplexityProcess.kill('SIGKILL'); // Use SIGKILL to forcefully terminate the process
      perplexityProcess.stdout.removeAllListeners('data');
      perplexityProcess.stderr.removeAllListeners('data');
      perplexityProcess = null;
      console.log('Perplexity process terminated.');
    } catch (error) {
      console.error('Failed to terminate perplexity process:', error);
    }
  } else {
    console.log('No perplexity process to terminate.');
  }

  mainWindow.webContents.send('perplexityComplete');
  perplexityProcess = null;
}

const createWindow = async () => {
  mainWindow = new BrowserWindow({
    minWidth: 480,
    minHeight: 695,
    maximizable: true,
    useContentSize: true,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      preload: path.join(__dirname, "preload.js"),
    },
    icon: __dirname + "/img/taskbar.png",
  });

  const expressApp = express();

  let astroDistPath;
  if (process.env.NODE_ENV === "development") {
    astroDistPath = "astroDist";
  } else {
    astroDistPath = path.join(process.resourcesPath, "astroDist");
  }

  expressApp.use(express.static(astroDistPath));
  expressApp.listen(8080, () => {
    console.log("Express server listening on port 8080");
  });

  initApplicationMenu(mainWindow);

  mainWindow.loadURL("http://localhost:8080/index.html");

  mainWindow.webContents.setWindowOpenHandler(() => {
    return { action: "deny" };
  });

  tray = new Tray(path.join(__dirname, "img", "tray.png"));
  const contextMenu = Menu.buildFromTemplate([
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
        app.quit();
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

  ipcMain.on("openURL", (event, arg) => {
    try {
      const parsedUrl = new url.URL(arg);
      const domain = parsedUrl.hostname;

      const isSafeDomain = safeDomains.some((safeDomain) => {
        const safeDomainHostname = new url.URL(safeDomain).hostname;
        return safeDomainHostname === domain;
      });

      if (isSafeDomain) {
        shell.openExternal(arg);
      } else {
        console.error(`Rejected opening URL with unsafe domain: ${domain}`);
      }
    } catch (err) {
      console.error(`Failed to open URL: ${err.message}`);
    }
  });

  ipcMain.on("runInference", (event, arg) => {
    runInference(arg);
  });

  ipcMain.on("stopInference", (event) => {
    terminateInference();
  });

  ipcMain.handle('openFileDialog', async () => {
    const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: 'GGUF Files', extensions: ['gguf'] }]
    });
    return result.filePaths;
  });

  ipcMain.handle('getMaxThreads', async () => {
    return os.cpus().length;
  });

  ipcMain.on("runBenchmark", (event, arg) => {
    runBenchmark(arg);
  });

  ipcMain.on("stopBenchmark", (event) => {
    terminateBenchmark();
  });

  ipcMain.on("runPerplexity", (event, arg) => {
    runPerplexity(arg);
  });
  
  ipcMain.on("stopPerplexity", (event) => {
    terminatePerplexity();
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

const currentOS = os.platform();
if (currentOS === "win32" || currentOS === "linux") {
  // windows + linux setup phase
  const gotTheLock = app.requestSingleInstanceLock();

  if (!gotTheLock) {
    app.quit();
  }

  app.whenReady().then(() => {
    createWindow();
  });
} else {
  app.whenReady().then(() => {
    createWindow();
  });

  app.on('before-quit', (event) => {
    terminateInference();
    terminateBenchmark();
  });
  
  app.on('will-quit', (event) => {
    terminateInference();
    terminateBenchmark();
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });

  app.on("activate", () => {
    if (mainWindow === null) {
      createWindow();
    }
  });
}