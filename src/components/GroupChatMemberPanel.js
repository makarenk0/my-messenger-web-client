import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {
  connectToServer,
  sendDataToServer,
  subscribeToUpdate,
} from "../actions/ConnectionActions";
import {
  loadDB,
  saveDocToDB,
  loadDocFromDB,
  removeDocFromDB,
  addOneToArray,
  addManyToArray,
  removeFromArray,
  getProjected,
  updateValue,
} from "../actions/LocalDBActions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Button,
  Modal,
  Form,
  InputGroup,
  Col,
  FormControl,
  ListGroup,
  Spinner,
} from "react-bootstrap";
import { SEARCH_USERS_WAIT_TIMEOUT } from "../configs";

const GroupChatMemberPanel = (props) => {
  const [chatName, setChatName] = useState("");
  const [chatUsers, setChatUsers] = useState([]);


  useEffect(() => {
    setChatName(props.chatName);
  }, [props.chatName]);

  useEffect(() => {
    setChatUsers(props.membersInfo);
  }, [props.membersInfo]);

  const addedUsers = (item) => {
    let fullname = item.FirstName + " " + item.LastName;
    return (
      <ListGroup.Item
        key={item.UserId}
      >
        <div style={{ marginLeft: "-15px", marginTop: "-8px" }}>
          <div className="chatIcon">
            <div
              style={{
                borderRadius: "25px",
                backgroundColor: "#CCCCCC",
                width: "50px",
                height: "50px",
                position: "absolute",
              }}
            >
              <FontAwesomeIcon
                icon={"user"}
                size="2x"
                className="fontAwesomeIcon"
              />
            </div>
          </div>
        </div>

        <div style={{ marginLeft: "60px", marginTop: "4px" }}>
          <p style={{ marginBottom: 0 }}>{fullname}</p>
          <p style={{ marginBottom: 0, fontWeight: "600" }}>
            {"@"}
            {item.Login}
          </p>
        </div>
      </ListGroup.Item>
    );
  };


  return (
    <Modal
      show={props.showPublicChats}
      onHide={() => {
        props.onClose(false);
      }}
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title>{chatName}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Row className="align-items-center">
            <Col xs="auto" style={{ display: "block", margin: "auto" }}>
              <p style={{ fontSize: "20px" }}>Members</p>
            </Col>
          </Form.Row>

          <Form.Row className="align-items-center">
            <Col xs="12" style={{ display: "block", margin: "auto" }}>
              <div
                style={{
                  height: "380px",
                  overflowY: "scroll",
                }}
              >
                <ListGroup>
                  {chatUsers.map((x) => {
                    return addedUsers(x);
                  })}
                </ListGroup>
              </div>
            </Col>
          </Form.Row>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="danger"
          onClick={() => {
            props.leaveChat()
            props.onClose(false);
          }}
        >
         Leave chat
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const mapStateToProps = (state) => {
  const { connectionReducer, localDBReducer } = state;
  return {
    connectionReducer,
    localDBReducer,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      connectToServer,
      sendDataToServer,
      subscribeToUpdate,
      loadDB,
      saveDocToDB,
      loadDocFromDB,
      removeDocFromDB,
      addOneToArray,
      addManyToArray,
      removeFromArray,
      getProjected,
      updateValue,
    },
    dispatch
  );

const ConnectedGroupChatMemberPanel = connect(
  mapStateToProps,
  mapDispatchToProps
)(GroupChatMemberPanel);

export default ConnectedGroupChatMemberPanel;
