import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "react-bootstrap";

const SlidingPaneContent = (props) => {
  return (
    <div>
      <div style={{ width: "50px", height: "150px" }}>
        <div className="chatIcon">
          <div
            style={{
              borderRadius: "55px",
              backgroundColor: "#CCCCCC",
              width: "110px",
              height: "110px",
              position: "absolute",
            }}
          >
            <FontAwesomeIcon
              icon={"user"}
              size="5x"
              className="fontAwesomeIcon"
            />
          </div>
        </div>
      </div>
      <div>
        <p style={{ fontWeight: "500", fontSize: "2em" }}>
          {props.userInfo.FirstName + " " + props.userInfo.LastName}
        </p>
        <p style={{ fontWeight: "500", fontSize: "1.1em" }}>
          {"@"}
          {props.userInfo.Login}
        </p>
      </div>
      <div style={{ display: "block" }}>
        <Button
          variant="light"
          className="sidePaneItem"
          style={{ textAlign: "left" }}
          onClick={() => {
            props.contactsOnClick();
          }}
        >
            <FontAwesomeIcon
              icon={"address-card"}
              size="1x"
              className="fontAwesomeIcon"
            />
           <b>Contacts</b>
        </Button>
        <Button
          variant="light"
          className="sidePaneItem"
          style={{ textAlign: "left" }}
          onClick={() => {
            props.publicChatsOnClick();
          }}
        >
          <FontAwesomeIcon
              icon={"comment-dots"}
              size="1x"
              className="fontAwesomeIcon"
            />
          <b>Public chats</b>
        </Button>
        <Button
          variant="light"
          className="sidePaneItem"
          style={{ textAlign: "left" }}
          onClick={() => {
            props.logOutOnclick();
          }}
        >
          <FontAwesomeIcon
              icon={"sign-out-alt"}
              size="1x"
              className="fontAwesomeIcon"
            />
          <b>Log out</b>
        </Button>
      </div>
    </div>
  );
};

export default SlidingPaneContent;
