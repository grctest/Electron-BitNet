import { ipcRenderer, contextBridge } from "electron";

contextBridge.exposeInMainWorld("electron", {
  openURL: async (target) => ipcRenderer.send("openURL", target),
  openFileDialog: async () => ipcRenderer.invoke("openFileDialog"),
  getMaxThreads: async () => ipcRenderer.invoke("getMaxThreads"),
  //
  onAiResponse: (func) => {
    ipcRenderer.on("aiResponse", (event, data) => {
      func(data);
    });
  },
  onAiError: (func) => {
    ipcRenderer.on("aiError", (event) => {
      func();
    });
  },
  onAiComplete: (func) => {
    ipcRenderer.on("aiComplete", (event) => {
      func();
    });
  },
  runInference: async (args) => ipcRenderer.send("runInference", args),
  stopInference: async (args) => ipcRenderer.send("stopInference", args),
  //
  onBenchmarkLog: (func) => {
    ipcRenderer.on("benchmarkLog", (event, data) => {
      func(data);
    });
  },
  onBenchmarkComplete: (func) => {
    ipcRenderer.on("benchmarkComplete", (event) => {
      func();
    });
  },
  runBenchmark: async (args) => ipcRenderer.send("runBenchmark", args),
  stopBenchmark: async (args) => ipcRenderer.send("stopBenchmark", args),
  //
  onPerplexityLog: (func) => {
    ipcRenderer.on("perplexityLog", (event, data) => {
      func(data);
    });
  },
  onPerplexityComplete: (func) => {
    ipcRenderer.on("perplexityComplete", (event) => {
      func();
    });
  },
  runPerplexity: async (args) => ipcRenderer.send("runPerplexity", args),
  stopPerplexity: async (args) => ipcRenderer.send("stopPerplexity", args),
});
