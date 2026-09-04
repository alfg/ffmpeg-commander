# `ffmpeg-commander`
A simple web UI for generating common FFmpeg encoding operations.

https://ffmpeg-commander.com

> 💡 Skip the terminal. **[Video Commander](https://video-commander.com?ref=ffmpeg-commander)** runs the encode — free for personal use.


[![github pages](https://github.com/alfg/ffmpeg-commander/actions/workflows/github-pages.yml/badge.svg)](https://github.com/alfg/ffmpeg-commander/actions/workflows/github-pages.yml)
[![Node.js CI](https://github.com/alfg/ffmpeg-commander/actions/workflows/node.js.yml/badge.svg)](https://github.com/alfg/ffmpeg-commander/actions/workflows/node.js.yml)

<img width="1064" height="943" alt="FFmpeg Commander Screenshot (dark)" src="https://github.com/user-attachments/assets/f557a03b-1a3e-4833-836f-af4b009d5a1d" />

<img width="1064" height="943" alt="FFmpeg Commander Screenshot (light)" src="https://github.com/user-attachments/assets/78b70459-60d6-4172-84bb-72cfd4a4f6df" />



Read the blog post at: https://dev.to/alfg/ffmpeg-the-easy-way-4a0h

Check out [docker-ffmpeg](https://github.com/alfg/docker-ffmpeg) for a customized Docker build of FFmpeg.


## Why?
`FFmpeg` has many simple and complex options, which can be intimidating at first. I wanted to create a simple interface for generating common encoding operations for video and audio, inspired by [HandBrake](https://handbrake.fr/).

This tool does NOT cover all options of FFmpeg and some assumptions are made when generating the output. So adjustments may be necessary. Generated options may also vary based on your FFmpeg version and build configuration.

If you feel some options can be improved, feel free to open an issue or pull request.

## Development
`ffmpeg-commander` is built with [React](https://react.dev), [Vite](https://vite.dev) and
[Tailwind CSS](https://tailwindcss.com).

Node 20 or newer. [NVM](https://github.com/nvm-sh/nvm) is recommended for managing versions.

### Install
```bash
npm install
npm run dev
```
* Load `http://localhost:5173/` in the web browser.

### Test, lint and build
```bash
npm test
npm run lint
npm run build
```

### Layout
```
src/lib/          framework-agnostic modules: command generation, the URL
                  contract, presets, storage, the ffmpegd client
src/lib/__tests__ the test suite
src/components/   React components (ui/ primitives, sections/ form groups)
src/hooks/        form state, presets, theme, ffmpegd connection
```

### Deploy
Deploys to [GitHub Pages](https://pages.github.com/) automatically on every push to
`master`, via `.github/workflows/github-pages.yml`. To publish by hand:
```
npm run deploy
```

## `ffmpegd`
`ffmpegd` is an optional companion application that connects `ffmpeg-commander` to `ffmpeg` by providing a websocket server to send encode tasks and receive realtime progress updates back to the browser. This allows using ffmpeg-commander as a GUI for ffmpeg.

See: https://github.com/alfg/ffmpegd

When running the dev server, the Vite config proxies `/ws` and `/files` to
`localhost:8080`. `ffmpegd` only accepts a websocket upgrade whose `Origin`
matches its own host and port, so a dev server on another port cannot reach it
directly.



### TODO
* Support multiple inputs and map option
* Expand on Filter options

## License
MIT
