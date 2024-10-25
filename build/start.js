const childProcess = require('child_process');
const electron = require('electron');
const webpack = require('webpack');
const mainConfig = require('./webpack.main.config.js');
const preloadConfig = require('./webpack.preload.config.js');

const env = "development";
const mainCompiler = webpack(mainConfig(env));
const preloadCompiler = webpack(preloadConfig(env));

let electronStarted = false;
let mainDone = false;
let preloadDone = false;

const startElectron = () => {
  if (!electronStarted && mainDone && preloadDone) {
    electronStarted = true;

    childProcess
      .spawn(electron, ["."], { stdio: "inherit" })
      .on("close", () => {
        mainWatching.close();
        preloadWatching.close();
      });
  }
};

const mainWatching = mainCompiler.watch({}, (err, stats) => {
  if (!err && !stats.hasErrors()) {
    mainDone = true;
    startElectron();
  }
});

const preloadWatching = preloadCompiler.watch({}, (err, stats) => {
  if (!err && !stats.hasErrors()) {
    preloadDone = true;
    startElectron();
  }
});