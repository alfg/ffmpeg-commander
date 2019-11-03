# ffmpeg-commander
> `ffmpeg-commander` is a simple web UI for generating FFmpeg commands.

* Currently a work-in-progress! Check back for updates!

https://alfg.github.io/ffmpeg-commander/

## Development
`ffmpeg-commander` is build with [Vue.js](https://vuejs.org

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

## License
MIT