import store from './store';

const LOCALSTORAGE_WS_URI = 'ws_uri';
const RETRY_TIMEOUT = 5000;

const wsUri = window.localStorage.getItem(LOCALSTORAGE_WS_URI) || 'ws://localhost:8080/ws';

const websocket = {
  conn: null as null | WebSocket,
  connect() {
    const ws = new WebSocket(wsUri);
    ws.onopen = () => {
      console.info('[ffmpeg-commander] - websocket connection detected.');
      store.setWSAction(ws.readyState === WebSocket.OPEN);
    };

    ws.onclose = () => {
      console.info('[ffmpeg-commander] - websocket connection closed.');
      store.setWSAction(ws.readyState === WebSocket.OPEN);
      ws.close();

      setTimeout(() => {
        if (store.state.ffmpegdEnabled) {
          console.log('[ffmpeg-commander] - websocket retrying connection...');
          websocket.conn = websocket.connect();
        }
      }, RETRY_TIMEOUT);
    };

    ws.onerror = (event) => {
      console.info('[ffmpeg-commander] - websocket connection error.', event);
      ws.close();
    };
    return ws;
  },

  start() {
    console.info('[ffmpeg-commander] - starting connection.');
    websocket.conn = websocket.connect();
  },

  stop() {
    console.info('[ffmpeg-commander] - stopping connection.');
    if (websocket.conn) {
      websocket.conn.close();
      websocket.conn = null;
    }
  },
};

export default websocket;
