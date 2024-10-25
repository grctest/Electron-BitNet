import { ipcRenderer, contextBridge } from "electron";

contextBridge.exposeInMainWorld("electron", {
  openURL: async (target) => ipcRenderer.send("openURL", target),
  // on aiResponse
  onAiResponse: (func) => {
    ipcRenderer.on("aiResponse", (event, data) => {
      func(data);
    });
  },
  runInference: async (args) => ipcRenderer.send("runInference", args),
  stopInference: async () => ipcRenderer.send("stopInference")
});
