import { ipcRenderer, contextBridge } from "electron";

contextBridge.exposeInMainWorld("electron", {
  openURL: async (target) => ipcRenderer.send("openURL", target),
  // on aiResponse
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
  stopInference: async (args) => ipcRenderer.send("stopInference", args)
});
