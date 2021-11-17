// https://github.com/websockets/ws/issues/1117#issuecomment-302865063

var ws;

if (typeof WebSocket !== 'undefined') {
  ws = WebSocket;
} else if (typeof MozWebSocket !== 'undefined') {
  ws = MozWebSocket;
} else {
  ws = window.WebSocket || window.MozWebSocket;
}

module.exports = ws;