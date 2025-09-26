import { ipcRenderer, contextBridge } from "electron";

contextBridge.exposeInMainWorld("electron", {
  // --- General ---
  openURL: async (target) => ipcRenderer.send("openURL", target),
  openFileDialog: async () => ipcRenderer.invoke("openFileDialog"),
  getMaxThreads: async () => ipcRenderer.invoke("getMaxThreads"),

  // --- Standard Inference (Non-Interactive) ---
  runInference: async (args) => ipcRenderer.send("runInference", args),
  stopInference: async () => ipcRenderer.send("stopInference"), // Used by both modes
  onAiResponse: (func) => {
    const listener = (event, data) => func(data);
    ipcRenderer.on("aiResponse", listener);
    return () => ipcRenderer.removeListener("aiResponse", listener); // Return cleanup function
  },
  onAiError: (func) => {
    const listener = (event, errorMsg) => func(errorMsg); // Pass error message
    ipcRenderer.on("aiError", listener);
    return () => ipcRenderer.removeListener("aiError", listener); // Return cleanup function
  },
  onAiComplete: (func) => {
    const listener = (event) => func();
    ipcRenderer.on("aiComplete", listener);
    return () => ipcRenderer.removeListener("aiComplete", listener); // Return cleanup function
  },

  // --- Instruction/Conversational Inference (Interactive) ---
  initInstructInference: async (args) => ipcRenderer.send("initInstructInference", args),
  sendInstructPrompt: async (promptText) => ipcRenderer.send("sendInstructPrompt", promptText),
  onAiInstructStarted: (func) => {
    const listener = (event) => func();
    ipcRenderer.on("aiInstructStarted", listener);
    return () => ipcRenderer.removeListener("aiInstructStarted", listener); // Return cleanup function
  },
  onAiResponseChunk: (func) => {
    const listener = (event, chunk) => func(chunk);
    ipcRenderer.on("aiResponseChunk", listener);
    return () => ipcRenderer.removeListener("aiResponseChunk", listener); // Return cleanup function
  },
  onAiInstructComplete: (func) => {
    const listener = (event) => func();
    ipcRenderer.on("aiInstructComplete", listener);
    return () => ipcRenderer.removeListener("aiInstructComplete", listener); // Return cleanup function
  },

  // --- Benchmark ---
  onBenchmarkLog: (func) => {
    const listener = (event, data) => func(data);
    ipcRenderer.on("benchmarkLog", listener);
    return () => ipcRenderer.removeListener("benchmarkLog", listener); // Return cleanup function
  },
  onBenchmarkComplete: (func) => {
    const listener = (event) => func();
    ipcRenderer.on("benchmarkComplete", listener);
    return () => ipcRenderer.removeListener("benchmarkComplete", listener); // Return cleanup function
  },
  runBenchmark: async (args) => ipcRenderer.send("runBenchmark", args),
  stopBenchmark: async (args) => ipcRenderer.send("stopBenchmark", args),

  // --- Perplexity ---
  onPerplexityLog: (func) => {
    const listener = (event, data) => func(data);
    ipcRenderer.on("perplexityLog", listener);
    return () => ipcRenderer.removeListener("perplexityLog", listener); // Return cleanup function
  },
  onPerplexityComplete: (func) => {
    const listener = (event) => func();
    ipcRenderer.on("perplexityComplete", listener);
    return () => ipcRenderer.removeListener("perplexityComplete", listener); // Return cleanup function
  },
  runPerplexity: async (args) => ipcRenderer.send("runPerplexity", args),
  stopPerplexity: async (args) => ipcRenderer.send("stopPerplexity", args),
});