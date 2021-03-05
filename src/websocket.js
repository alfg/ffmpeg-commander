import store from './store';

const LOCALSTORAGE_WS_URI = 'ws_uri';
const RETRY_TIMEOUT = 5000;

const wsUri = window.localStorage.getItem(LOCALSTORAGE_WS_URI) || 'ws://localhost:8080/ws';

const websocket = {
  conn: null,
  connect() {
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
