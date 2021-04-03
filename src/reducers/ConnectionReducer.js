import { combineReducers } from "redux";
import { LOCAL_SERVER_IP } from "../configs";

const INITIAL_STATE = {
  current: {},
};

var onReceiveCallbacks = [];

const formPacket = (packetType, payload) => {
  let base64Payload =
    String.fromCharCode(packetType + 48) + btoa(payload) + "~";
    console.log(base64Payload)
  return base64Payload;
};

const connectionReducer = (state = INITIAL_STATE, action) => {
  const { current } = state;

  switch (action.type) {
    case "CONNECT":
      var websocket = new WebSocket(action.payload.host);

      websocket.onopen = (e) => {
        action.payload.onSuccessfullConnect("");
      };
      websocket.onclose = (e) => {
        action.payload.onServerClosedConnection();
      };
      websocket.onerror = (e) => {
        action.payload.onServerClosedConnection();
      };

      // establishedConnection.on('close', function(){
      //   console.log('Connection closed!');
      // });
      // establishedConnection.on('error', function(){
      //   console.log('Error');
      // });

      current["establishedConnection"] = websocket;

      current.establishedConnection.onmessage = (e) => {
        let response = e.data
        let payloadB64 = response.substr(1, response.length-2)
        let fromBase64 = atob(payloadB64)
        console.log(fromBase64);
      };
      // current.establishedConnection.on('data', function (data) {
      //   let result = '';
      //   for (var i = 0; i < data.length; i++) {
      //     result += String.fromCharCode(parseInt(data[i]));
      //   }
      //   EncryptionModule.disassemblePacketFromReact(result, (disassembled) => {

      //     disassembled.forEach((packetWithType) =>{
      //       let onReceive = onReceiveCallbacks.filter(
      //         (x) => x.type == packetWithType.charAt(0),
      //       );
      //       onReceive.forEach((el) => {
      //         if (el.disposable) {
      //           // if disposable use callback once and then remove object from callbacks array
      //           let index = onReceiveCallbacks.findIndex(
      //             (x) => x.type == result.charAt(0),
      //           );
      //           onReceiveCallbacks.splice(index, 1);
      //           console.log('Callback with type ' + el.type + ' was disposed');
      //         }
      //         let getObj = JSON.parse(packetWithType.slice(1));
      //         el.callback(getObj);
      //       });
      //     })

      //   });
      // });

      const newState = { current };
      return newState;
    case "SEND_RECEIVE_DATA":
      console.log(action.payload.packetPayload);

      let packetToSend = formPacket(
        action.payload.packetType,
        action.payload.packetPayload
      );

      onReceiveCallbacks.unshift({
        type: String.fromCharCode(action.payload.packetType + 48),
        disposable: action.payload.disposable,
        callback: action.payload.callback,
      });
      console.log( current.establishedConnection)
      current.establishedConnection.send(packetToSend);
      return state;

    case "SUBSCRIBE_FOR_SERVER_EVENTS":
      let alreadyPresent = onReceiveCallbacks.findIndex(
        (x) => x.id == action.payload.id
      );
      if (alreadyPresent != -1) {
        //checking if there are no callbacks with such id already
        onReceiveCallbacks[alreadyPresent].callback = action.payload.callback;
      } else {
        onReceiveCallbacks.unshift({
          type: String.fromCharCode(action.payload.packetType + 48),
          id: action.payload.id,
          disposable: false,
          callback: action.payload.callback,
        });
      }
      return state;
    case "UNSUBSCRIBE_FROM_SERVER_EVENTS":
      let index = onReceiveCallbacks.findIndex(
        (x) => x.id == action.payload.id
      );
      let removed = onReceiveCallbacks.splice(index, 1);
      action.payload.callback(removed);
      return state;

    case "SET_SESSION_TOKEN_AND_ID":
      current["sessionToken"] = action.payload.sessionToken;
      current["myId"] = action.payload.userId;
      return { current };
    default:
      return state;
  }
};

export default combineReducers({
  connection: connectionReducer,
});
// export const ConnectionReducer = combineReducers({
//   connectionReducer
// });
