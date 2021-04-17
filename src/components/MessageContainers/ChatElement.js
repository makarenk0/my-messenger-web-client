import React from "react";

const ChatElement = (props) => {

  const decapsulateDateFromId = (id) => {
    let decapsulatedDate = parseInt(id.substring(0, 8), 16) * 1000;
    let date = new Date(decapsulatedDate);
    return date.toTimeString().split(' ')[0].substr(0, 5);
  };
  
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
      key={props.id}
      style={props.containerStyle}
      onClick={() => {
        props.messageOnClick(props.id);
      }}
    >
      <div style={props.messageBoxStyle}>
        <p style={props.senderNameStyle}>{props.senderName}</p>
        {parseMessageContent(props.body)}
        <p style={props.timestampStyle}>{decapsulateDateFromId(props.id)}</p>
      </div>
    </div>
  );
};

export default ChatElement;
