# `ffmpeg-commander`
A simple web UI for generating common FFmpeg encoding operations.

https://alfg.github.io/ffmpeg-commander/

[![github pages](https://github.com/alfg/ffmpeg-commander/actions/workflows/github-pages.yml/badge.svg)](https://github.com/alfg/ffmpeg-commander/actions/workflows/github-pages.yml)
[![Node.js CI](https://github.com/alfg/ffmpeg-commander/actions/workflows/node.js.yml/badge.svg)](https://github.com/alfg/ffmpeg-commander/actions/workflows/node.js.yml)

![screenshot](https://user-images.githubusercontent.com/702541/146104964-3aaccb1a-08c8-47df-b4b9-e21a6c8c80ab.png)

Read the blog post at: https://dev.to/alfg/ffmpeg-the-easy-way-4a0h

Check out [docker-ffmpeg](https://github.com/alfg/docker-ffmpeg) for a customized Docker build of FFmpeg.


## Why?
`FFmpeg` has many simple and complex options, which can be intimidating at first. I wanted to create a simple interface for generating common encoding operations for video and audio, inspired by [HandBrake](https://handbrake.fr/).

This tool does NOT cover all options of FFmpeg and some assumptions are made when generating the output. So adjustments may be necessary. Generated options may also vary based on your FFmpeg version and build configuration.

If you feel some options can be improved, feel free to open an issue or pull request.

## Development
`ffmpeg-commander` is built with [Vue.js](https://vuejs.org) and [Bootstrap Vue](https://bootstrap-vue.org/).

### Supported Node [LTS](https://nodejs.org/en/about/releases/) Versions
* v12
* v14
* v16

[NVM](https://github.com/nvm-sh/nvm) is recommended for quickly installing and using different versions of Node.js.

### Install
```bash
npm install
npm run serve
```
* Load `http://localhost:8080/` in the web browser.

### Compiles and minifies for production
```
npm run build
```

### Deploy
Deploys to [Github Pages](https://pages.github.com/)
```
npm run deploy
```

### Docker
```
docker build -t ffmpeg-commander .
docker run -it -p 8080:80 --rm ffmpeg-commander
```

## `ffmpegd`
`ffmpegd` is an optional companion application that connects `ffmpeg-commander` to `ffmpeg` by providing a websocket server to send encode tasks and receive realtime progress updates back to the browser. This allows using ffmpeg-commander as a GUI for ffmpeg.

See: https://github.com/alfg/ffmpegd


### TODO
* Support multiple inputs and map option
* Expand on Filter options

## License
MIT
