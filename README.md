# Electron-BitNet

Attempting to run Microsoft's BitNet LLM via Electron (Sans Python)

How to setup this application:

- Use python to prepare 1-bit models
  - Follow [Microsoft's instructions](https://github.com/microsoft/BitNet?tab=readme-ov-file#installation), installing visual studio 2022 (including c++ desktop build tools & clang build tools) and preparing the 1-bit model for use.
- Include your generated model within the `models` folder
  - Currently supports `ggml-model-i2_s.gguf` which is built from `HF1BitLLM/Llama3-8B-1.58-100B-tokens` following [Microsoft's instructions](https://github.com/microsoft/BitNet?tab=readme-ov-file#installation).
- Optionally include your own generated bin release files within the `bin\Release` folder
- Run the commands below to build and run the app

| Command                                | Action                                           |
| :------------------------------------- | :----------------------------------------------- |
| `npm install`                          | Installs dependencies                            |
| `npm run dev`                          | Starts local dev server at `localhost:4321`      |
| `npm run build:astro`                  | Builds the production site at `./dist/`          |
| `npm run build:astro \| npm run start` | Builds then runs the electorn app in dev mode.   |
| `npm run dist:windows-latest`          | Builds the windows application.                  |

Reference project: https://github.com/microsoft/BitNet

---

Note: At the moment only Windows is supported, Linux support may come in the future.

---

Place your generated 1-bit models (e.g. ggml-model-i2_s.gguf) in the `models` folder.