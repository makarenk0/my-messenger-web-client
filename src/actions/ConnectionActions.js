export const connectToServer = (ipAddress, onSuccessfullConnect, onServerClosedConnection) => (
    {
      type: 'CONNECT',
      payload: {'host': ipAddress, 'onSuccessfullConnect': onSuccessfullConnect, 'onServerClosedConnection': onServerClosedConnection}
    }
  );

export const sendDataToServer = (packetType, disposable, packetPayload, callback) => (
    {
      type: 'SEND_RECEIVE_DATA',
      payload: {'packetType': packetType, 'disposable': disposable, 'packetPayload': typeof packetPayload === 'string' ? packetPayload : JSON.stringify(packetPayload), 'callback': callback}
    }
);

export const subscribeToUpdate = (packetType, id, callback) => (
  {
    type: 'SUBSCRIBE_FOR_SERVER_EVENTS',
    payload: {'packetType': packetType, "id": id, 'callback': callback}
  }
);

export const unsubscribeFromUpdate = (id, callback) => (
  {
    type: 'UNSUBSCRIBE_FROM_SERVER_EVENTS',
    payload: {"id": id, 'callback': callback}
  }
);

export const setSessionTokenAndId = (token, id) => (
  {
    type: 'SET_SESSION_TOKEN_AND_ID',
    payload: {"sessionToken": token, "userId": id}
  }
);
