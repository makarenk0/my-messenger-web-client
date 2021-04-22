import React, { useEffect, useState } from "react";

const MessageBox = (props) => {
  
  const [isSelected, setSelected] = useState(false);
  const parseMessageContent = (content) => {
    
    let words = content.split(' ');

    let elements = [];
    let textBuf = '';
    for (var i = 0; i < words.length; i++) {
      if (words[i].substr(0, 4) == 'http') {

        if(textBuf !== ""){
          elements.push(<p key={i - 1} style={{marginBottom: 5}}>{textBuf}</p>);
          textBuf = '';
        }
       
        if (words[i].substr(-3) === 'png' || words[i].substr(-3) === 'jpg') {
          elements.push(
            <img style={{display: "block", margin: "auto", maxWidth: "450px"}}
              key={i}
              src={words[i]}
            />,
          );
        } else {
          elements.push(
            <p key={i} style={{}}><a 
              style={{color: 'blue'}}
              href={words[i]}
              target="_blank">
              {words[i]}
              
            </a>
            </p>,
          );
        }
      } else {
        textBuf = textBuf.concat(i === 0 ? '' : ' ', words[i]);
      }
    }
    if (textBuf !== '') {
      elements.push(<p key={i} style={{marginBottom: 5}}>{textBuf}</p>);
    }
    return <div style={{maxWidth: "450px"}}>{elements}</div>;
  };


  return (
    <div
    
      onClick={() => {
        if (!props.isSystem) {
          props.messageOnClick(props._id);
          setSelected(!isSelected);
        }
      }}
    >
      <div
        style={
          props.isSystem
            ? {
                backgroundColor: "#b8b5ff",
                borderRadius: 5,
                paddingTop: 5,
                paddingLeft: 10,
                paddingRight: 10,
                width: "fit-content",
                margin: "auto",
                alignSelf: "center",
              }
            : {
                backgroundColor: isSelected
                  ? "#29bb89"
                  : props.isMine
                  ? "#00BCD4"
                  : "#03a9f4",
                paddingTop: 5,
                paddingLeft: 10,
                paddingRight: 10,
                borderRadius: 5,
                marginTop: 10,
                width: "fit-content",
                marginLeft: 15,
              }
        }
      >
        {!props.isMine && !props.isSystem && props.isGroup ? (
          <p
            key={"Username"}
            style={{
              fontWeight: "bold",
              marginBottom: 5,
            }}
          >
            {props.memberName}
          </p>
        ) : null}
          {parseMessageContent(props.body)}
        <p
          key={"Timestamp"}
          style={
            props.isSystem
              ? { fontSize: 15, textAlign: "center", paddingBottom: 4 }
              : { fontSize: 12, paddingBottom: 4 }
          }
        >
          {props.isSystem ? "at " : null}
          {props.timestamp}
        </p>
      </div>
    </div>
  );
};

export default MessageBox;
