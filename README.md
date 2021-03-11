# `ffmpeg-commander`
A simple web UI for generating common FFmpeg encoding operations.

https://alfg.github.io/ffmpeg-commander/

Check out [docker-ffmpeg](https://github.com/alfg/docker-ffmpeg) for a customized Docker build of FFmpeg.

![github pages](https://github.com/alfg/ffmpeg-commander/workflows/github%20pages/badge.svg)
[![Build Status](https://travis-ci.org/alfg/ffmpeg-commander.svg?branch=master)](https://travis-ci.org/alfg/ffmpeg-commander)


## Why?
`FFmpeg` has many simple and complex options, which can be intimidating at first. I wanted to create a simple interface for generating common encoding operations for video and audio, inspired by [HandBrake](https://handbrake.fr/).

This tool does NOT cover all options of FFmpeg and some assumptions are made when generating the output. So adjustments may be necessary. Generated options may also vary based on your FFmpeg version and build configuration.

If you feel some options can be improved, feel free to open an issue or pull request.

## Development
`ffmpeg-commander` is built with [Vue.js](https://vuejs.org) and [Bootstrap Vue](https://bootstrap-vue.org/).

### Install
```
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

### TODO
* Support multiple inputs and map option
* Expand on Filter options

## License
MIT
