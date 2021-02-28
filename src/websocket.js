import store from './store';

const LOCALSTORAGE_WS_URI = 'ws_uri';

const wsUri = window.localStorage.getItem(LOCALSTORAGE_WS_URI) || 'ws://localhost:8080/ws';
const ws = new WebSocket(wsUri);

ws.onopen = (event) => {
  console.info('[ffmpeg-commander] - websocket connection detected.');
  const isReady = event.target.readyState === WebSocket.OPEN;
  store.setWSAction(isReady);
};

ws.onclose = (event) => {
  console.info('[ffmpeg-commander] - websocket connection closed.');
  const isReady = event.target.readyState === WebSocket.OPEN;
  store.setWSAction(isReady);
};

ws.onerror = (event) => {
  console.info('[ffmpeg-commander] - websocket connection error.', event);
};

export default ws;
