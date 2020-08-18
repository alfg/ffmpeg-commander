# ffmpeg-commander
> `ffmpeg-commander` is a simple web UI for generating common FFmpeg commands.

*Generated options may vary based on your FFmpeg version and build configuration. Tested on version 4.3.1*

https://alfg.github.io/ffmpeg-commander/

![github pages](https://github.com/alfg/ffmpeg-commander/workflows/github%20pages/badge.svg)

Check out [docker-ffmpeg](https://github.com/alfg/docker-ffmpeg) for a customized Docker build of FFmpeg.

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
* Pre-configured presets
* Expand on Filter options
* Local settings & preferences
* Codec-specific options
* Share-friendly URLs

## License
MIT
