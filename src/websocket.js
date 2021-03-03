import store from './store';

const LOCALSTORAGE_WS_URI = 'ws_uri';
const RETRY_TIMEOUT = 5000;

const wsUri = window.localStorage.getItem(LOCALSTORAGE_WS_URI) || 'ws://localhost:8080/ws';

const conn = { ws: null };

function connect() {
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
    ws.close();

    setTimeout(() => {
      console.log('[ffmpeg-commander] - websocket retrying connection...');
      conn.ws = connect();
    }, RETRY_TIMEOUT);
  };

  ws.onerror = (event) => {
    console.info('[ffmpeg-commander] - websocket connection error.', event);
    ws.close();
  };
  return ws;
}

setInterval(() => {
  if (!conn.ws) {
    conn.ws = connect();
  }
}, 1000);

export default conn;
