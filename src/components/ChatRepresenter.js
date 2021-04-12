import React, { useState, useEffect } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const ChatRepresenter = (props) => {

  const chatPressed = () => {
    props.onPress(props.chatId, props.chatName);
  };

  return (
    <div className="chatRepresentorContainer" style={props.isSelected ? {backgroundColor: "#45b6fe"} : null} onClick={() =>{chatPressed()}}>
      <div className="chatIcon">
        <div style={{ borderRadius: "25px", backgroundColor: "#CCCCCC", width: "50px", height: "50px", position: "absolute" }}>
          <FontAwesomeIcon icon={props.isGroup ? 'users':'user'} size="2x" className="fontAwesomeIcon" />
        </div>
      </div>
      <div className="chatNameBlock">
        <div className="chatNameBox">
          <p>{props.chatName}</p>
        </div>
      </div>
      <div className="newMessagesCounterBlock">
        <div className="newMessagesCounterBox">
          <p>{props.newMessagesNum !== 0 ? props.newMessagesNum : null}</p>
        </div>
      </div>
    </div>
  );
};

export default ChatRepresenter;
