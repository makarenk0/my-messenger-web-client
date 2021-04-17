import React, {useState} from "react";
import ChatElement from "./ChatElement";

const OtherUserPublicMessage = (props) => {


  const [isSelected, setSelected] = useState(false)

  const messageOnClick = (id) => {
    setSelected(!isSelected)
    props.messageOnClick(id)
  };

  return (
    <ChatElement
      key={props.id}
      id={props.id}
      senderName={props.senderName}
      body={props.body}
      messageOnClick={messageOnClick}

      messageBoxStyle={{
        backgroundColor: isSelected ? "#29bb89" : "#03a9f4",
        paddingTop: 5,
        paddingLeft: 10,
        paddingRight: 10,
        borderRadius: 5,
        marginTop: 10,
        width: "fit-content",
        marginLeft: 15,
      }}
      senderNameStyle={{ fontWeight: "bold", marginBottom: 5 }}
      timestampStyle={{ fontSize: 12, paddingBottom: 4 }}
    />
  );
};

export default OtherUserPublicMessage;
