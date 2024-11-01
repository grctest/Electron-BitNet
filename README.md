# Electron-BitNet

Running [Microsoft's BitNet](https://github.com/microsoft/BitNet) via [Astro](https://astro.build/), [React](https://react.dev/) & [Electron](https://www.electronjs.org/)!

## Functionality

* Run Microsoft BitNet model inference
* Benchmark BitNet models
* Calculate BitNet model perplexity
* Switch between multiple languages

## How to setup this application

- Use python to prepare 1-bit models
  - Follow [Microsoft's instructions](https://github.com/microsoft/BitNet?tab=readme-ov-file#installation), installing visual studio 2022 (including c++ desktop build tools & clang build tools) and preparing the 1-bit model for use.
- Supports generated gguf models.
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

Prefer to use an installer? Check out the [latest windows releases](https://github.com/grctest/Electron-BitNet/releases)!