import React from "react";
import ChatElement from "./ChatElement";

const SystemMessage = (props) => {
  return (
    <ChatElement
      key={props.id}
      id={props.id}
      senderName={null}
      body={props.body}
      messageOnClick={() =>{}}
      isSelected={false}
      setSelected={() => {}}

      containerStyle={null}
      messageBoxStyle={{
        backgroundColor: "#b8b5ff",
        borderRadius: 5,
        paddingTop: 5,
        paddingLeft: 10,
        paddingRight: 10,
        width: "fit-content",
        margin: "auto",
        alignSelf: "center",
      }}
      senderNameStyle={{ display: "none" }}
      timestampStyle={{ fontSize: 15, textAlign: "center", paddingBottom: 4}}
    />
  );
};

export default SystemMessage;
