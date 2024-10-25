import { ipcRenderer, contextBridge } from "electron";

contextBridge.exposeInMainWorld("electron", {
  openURL: async (target) => ipcRenderer.send("openURL", target),
});
