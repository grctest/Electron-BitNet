import { execFile, spawn } from 'child_process';
import path from 'path';
import os from 'os';
import process from 'process';
import fs from 'fs';
import url from "url";
import { readFile } from 'fs/promises';
import mime from 'mime-types';

import { app, BrowserWindow, Menu, Tray, ipcMain, shell, protocol, dialog } from "electron";

import { initApplicationMenu } from "./lib/applicationMenu.js";

let mainWindow = null;
let tray = null;
let inferenceProcess = null;
let benchmarkProcess = null;
let perplexityProcess = null;

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'file',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true
    }
  }
]);

function sendInstructPrompt(promptText) {
  if (inferenceProcess && inferenceProcess.stdin && !inferenceProcess.stdin.destroyed) {
    try {
      // llama.cpp expects prompts ending with newline in interactive mode
      inferenceProcess.stdin.write(promptText + '\n');
      console.log('Sent prompt to instruction process:', promptText);
    } catch (error) {
      console.error('Failed to write to instruction process stdin:', error);
      mainWindow.webContents.send('aiError', 'Failed to send prompt to AI.');
      terminateInference(); // Stop if we can't communicate
    }
  } else {
    console.warn('Attempted to send prompt, but instruction process stdin is not available.');
    mainWindow.webContents.send('aiError', 'AI process is not running or not ready for input.');
  }
}

function terminateInference() {
  if (inferenceProcess) {
    console.log('Terminating inference process...');
    const pid = inferenceProcess.pid; // Get PID before killing
    try {
        // Check if it's a spawned process (has stdin property)
        if (inferenceProcess.stdin) {
            inferenceProcess.stdout?.removeAllListeners();
            inferenceProcess.stderr?.removeAllListeners();
            inferenceProcess.removeAllListeners('close');
            inferenceProcess.removeAllListeners('error');
        }
        // Force kill works for both spawn and execFile child processes
        inferenceProcess.kill('SIGKILL');
        console.log(`Inference process (PID: ${pid}) terminated.`);
    } catch (error) {
      console.error(`Failed to terminate inference process (PID: ${pid}):`, error);
    } finally {
       inferenceProcess = null;
       // Ensure the frontend knows it stopped, send appropriate completion signal
       if (mainWindow && mainWindow.webContents) {
           // Decide which completion signal based on context, or send a generic one
           mainWindow.webContents.send('aiComplete'); // For original mode
           mainWindow.webContents.send('aiInstructComplete'); // For instruction mode
       }
    }
  } else {
    console.log('No inference process to terminate.');
  }
}

function runBenchmark(args) {
  let benchPath = path.join(app.getAppPath(), 'bin', 'Release', 'llama-bench.exe');

  if (!fs.existsSync(benchPath)) {
    console.error('Benchmark binary not found, please build first.');
    return;
  }

  const commandArgs = [
    '-m', args.model,
    '-n', args.n_token,
    '-ngl', '0',
    '-b', '1',
    '-t', args.threads,
    '-p', args.n_prompt,
    '-r', '5'
  ];

  benchmarkProcess = execFile(benchPath, commandArgs, (error, stdout, stderr) => {
    if (error) {
      console.error(`execFile error: ${error}`);
      return;
    }

    if (stderr) {
      console.error(`stderr: ${stderr}`);
    }

    if (stdout) {
      mainWindow.webContents.send('benchmarkLog', stdout);
    }

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

  const commandArgs = [
    '--model', args.model,
    '--prompt', args.prompt,
    '--threads', args.threads,
    '--ctx-size', args.ctx_size,
    '--perplexity',
    '--ppl-stride', args.ppl_stride
  ];

  perplexityProcess = execFile(perplexityPath, commandArgs, (error, stdout, stderr) => {
    if (error) {
      console.error(`execFile error: ${error}`);
      return;
    }

    if (stderr) {
      console.error(`stderr: ${stderr}`);
      mainWindow.webContents.send('perplexityLog', stderr);
    }

    if (stdout) {
      mainWindow.webContents.send('perplexityLog', stdout);
    }

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

// --- New function to initialize instruction mode ---
function initInstructInference(args) {
  let mainPath = path.join(app.getAppPath(), 'bin', 'Release', 'llama-cli.exe');

  if (!fs.existsSync(mainPath)) {
    mainWindow.webContents.send('aiError', 'llama-cli.exe not found.');
    mainWindow.webContents.send('aiInstructComplete'); // Use a specific complete signal if needed
    return;
  }

  // Terminate any existing process first
  terminateInference();

  const commandArgs = [
    '-m', args.model,
    '-n', args.n_predict, // Max tokens per *turn* might need adjustment
    '-t', args.threads,
    '-p', args.prompt, // This is the initial system prompt
    '-ngl', '0',
    '-c', args.ctx_size,
    '--temp', args.temperature,
    '-b', '1',
    '-cnv' // Enable instruction/conversation mode
  ];

  try {
    inferenceProcess = spawn(mainPath, commandArgs);
    mainWindow.webContents.send('aiInstructStarted'); // Signal that it started

    inferenceProcess.stdout.on('data', (data) => {
      mainWindow.webContents.send('aiResponseChunk', data.toString());
    });

    inferenceProcess.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
      // Treat stderr as part of the output stream for now
      mainWindow.webContents.send('aiResponseChunk', data.toString());
    });

    inferenceProcess.on('error', (error) => {
      console.error(`spawn error: ${error}`);
      mainWindow.webContents.send('aiError', `Failed to start instruction mode: ${error.message}`);
      mainWindow.webContents.send('aiInstructComplete');
      inferenceProcess = null;
    });

    inferenceProcess.on('close', (code) => {
      console.log(`Instruction process exited with code ${code}`);
      mainWindow.webContents.send('aiInstructComplete'); // Signal completion
      inferenceProcess = null;
    });

  } catch (error) {
      console.error(`Failed to spawn instruction process: ${error}`);
      mainWindow.webContents.send('aiError', `Failed to spawn instruction process: ${error.message}`);
      mainWindow.webContents.send('aiInstructComplete');
      inferenceProcess = null;
  }
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

  initApplicationMenu(mainWindow);

  mainWindow.loadURL('file://index.html');

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
    let mainPath = path.join(app.getAppPath(), 'bin', 'Release', 'llama-cli.exe');
    if (!fs.existsSync(mainPath)) {
      mainWindow.webContents.send('aiError', 'llama-cli.exe not found.');
      mainWindow.webContents.send('aiComplete');
      return;
    }
    terminateInference(); // Terminate any existing process
    const commandArgs = [ /* ... original args ... */
      '-m', arg.model, '-n', arg.n_predict, '-t', arg.threads, '-p', arg.prompt,
      '-ngl', '0', '-c', arg.ctx_size, '--temp', arg.temperature, '-b', '1'
    ];
    const process = execFile(mainPath, commandArgs, (error, stdout, stderr) => {
      if (inferenceProcess === process) {
          inferenceProcess = null;
          if (error) { console.error(`execFile error: ${error}`); mainWindow.webContents.send('aiError', `Execution Error: ${error.message}`); mainWindow.webContents.send('aiComplete'); return; }
          if (stderr) { console.error(`stderr: ${stderr}`); /* Optionally send stderr */ }
          if (stdout) { mainWindow.webContents.send('aiResponse', stdout); }
          mainWindow.webContents.send('aiComplete');
      }
    });
    inferenceProcess = process; // Store ref
  });

  ipcMain.on("initInstructInference", (event, arg) => { // For interactive start
    initInstructInference(arg);
  });

  ipcMain.on("sendInstructPrompt", (event, promptText) => { // For interactive follow-up
    sendInstructPrompt(promptText);
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

  app.whenReady()
    .then(() => {
      protocol.handle('file', async (req) => {
        const { pathname } = new URL(req.url);
        if (!pathname) {
          return;
        }
        
        let fullPath = process.env.NODE_ENV === "development"
          ? path.join('astroDist', pathname)
          : path.join(process.resourcesPath, 'astroDist', pathname);
      
        if (pathname === '/') {
          fullPath = path.join(fullPath, 'index.html');
        }

        if (fullPath.includes("..") || fullPath.includes("~")) {
          return; // Prevent directory traversal attacks
        }

        let _res;
        try {
          _res = await readFile(fullPath);
        } catch (error) {
          console.log({ error });
        }

        const mimeType = mime.lookup(fullPath) || 'application/octet-stream';

        return new Response(_res, {
          headers: { 'content-type': mimeType }
        });
      });
    })
    .then(createWindow);
} else {
  app.whenReady().then(() => {
    protocol.handle('file', async (req) => {
      const { pathname } = new URL(req.url);
      if (!pathname) {
        return;
      }
      
      let fullPath = process.env.NODE_ENV === "development"
        ? path.join('astroDist', pathname)
        : path.join(process.resourcesPath, 'astroDist', pathname);
    
      if (pathname === '/') {
        fullPath = path.join(fullPath, 'index.html');
      }

      if (fullPath.includes("..") || fullPath.includes("~")) {
        return; // Prevent directory traversal attacks
      }

      let _res;
      try {
        _res = await readFile(fullPath);
      } catch (error) {
        console.log({ error });
      }

      const mimeType = mime.lookup(fullPath) || 'application/octet-stream';

      return new Response(_res, {
        headers: { 'content-type': mimeType }
      });
    });
  }).then(createWindow);

  app.on('before-quit', (event) => {
    terminateInference();
    terminateBenchmark();
    terminatePerplexity();
  });
  
  app.on('will-quit', (event) => {
    terminateInference();
    terminateBenchmark();
    terminatePerplexity();
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