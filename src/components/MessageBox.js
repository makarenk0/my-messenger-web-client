import React, { useEffect, useState } from "react";

const MessageBox = (props) => {
  const [isSelected, setSelected] = useState(false);

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
        <p
          key={"MessageBody"}
          style={{
            marginBottom: 5,
          }}
        >
          {props.body}
        </p>
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
