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

const CreateGroupChatScreen = (props) => {
  const [searchField, setSearchField] = useState("");
  const [chatName, setChatName] = useState("");
  const [chatUsers, setChatUsers] = useState([]);
  const [resultUsers, setResultUsers] = useState([]);
  const [userInputTimer, setUserInputTimer] = useState("");
  const [loading, setLoading] = useState(false);
  const [canCreate, setCanCreate] = useState(false);

  const isEmptyOrSpaces = (str) => {
    return str === null || str.match(/^ *$/) !== null;
  };

  const createButtonPressed = () => {
    let chatUserWithOwner = chatUsers.map((x) => x.UserId);
    chatUserWithOwner.push(
      props.connectionReducer.connection.current.currentUser.UserId
    );
    let sendObj = {
      SessionToken: props.connectionReducer.connection.current.sessionToken,
      UserIds: chatUserWithOwner,
      ChatName: chatName,
    };
    props.sendDataToServer("8", true, sendObj, (response) => {
      //only for private chats
      if ((response.status = "success")) {
        props.onClose(false);
      }
    });
  };

  useEffect(() => {
    console.log("can create ");
    setCanCreate(chatUsers.length > 0 && chatName != "");
  }, [chatName, chatUsers]);

  useEffect(() => {
    if (userInputTimer !== "") {
      clearTimeout(userInputTimer);
    }
    setLoading(true);
    setUserInputTimer(setTimeout(requestToServer, SEARCH_USERS_WAIT_TIMEOUT));
    setResultUsers([]);
  }, [searchField]);

  const requestToServer = () => {
    setLoading(false);
    if (!isEmptyOrSpaces(searchField)) {
      let finUsersObj = {
        SessionToken: props.connectionReducer.connection.current.sessionToken,
        FindUsersRequest: searchField,
      };

      props.sendDataToServer("3", true, finUsersObj, (response) => {
        if (response.Status == "success") {
          console.log(response.Users);
          let all = response.Users;
          all = all.filter(
            (x) => chatUsers.findIndex((y) => y.UserId == x.UserId) == -1
          );
          setResultUsers(all);
        } else {
          console.log(response.Status);
          console.log(response.Details);
        }
      });
    }
  };

  const searchUsers = (item) => {
    let fullname = item.FirstName + " " + item.LastName;
    return (
      <ListGroup.Item
        key={item.UserId}
        onClick={() => {
          userToAddPressed(item.UserId, fullname);
        }}
        className="listItem"
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

  const addedUsers = (item) => {
    let fullname = item.FirstName + " " + item.LastName;
    return (
      <ListGroup.Item
        key={item.UserId}
        onClick={() => {
          userAddedPressed(item.UserId, fullname);
        }}
        className="listItem"
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

  const userToAddPressed = (userId, userName) => {
    let user = resultUsers.find((x) => x.UserId == userId);

    setChatUsers([...chatUsers, user]);
    let all = resultUsers;
    console.log(userId);
    all = all.filter((x) => x.UserId != userId);
    console.log(all);
    setResultUsers(all);
  };

  const userAddedPressed = (userId, userName) => {
    let users = chatUsers;
    users = users.filter((x) => x.UserId != userId);
    setChatUsers(users);
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
        <Modal.Title>Create public chat</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Row className="align-items-center">
            <Col xs="5" style={{ display: "block", margin: "auto" }}>
              <Form.Label htmlFor="inlineFormInput" srOnly>
                Chat name
              </Form.Label>
              <Form.Control
                onChange={(e) => {
                  setChatName(e.target.value);
                }}
                value={chatName}
                className="mb-2"
                id="inlineFormInput"
                placeholder="Chat name"
              />
            </Col>
          </Form.Row>
          <Form.Row className="align-items-center">
            <Col xs="auto" style={{ display: "block", margin: "auto" }}>
              <p style={{ fontSize: "20px" }}>Members</p>
            </Col>
          </Form.Row>

          <Form.Row className="align-items-center">
            <Col xs="12" style={{ display: "block", margin: "auto" }}>
              <div
                style={{
                  height: "190px",
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
          <Form.Row
            className="align-items-center"
            style={{ marginTop: "20px" }}
          >
            <Col xs="auto" style={{ display: "block", margin: "auto" }}>
              <p style={{ fontSize: "20px" }}>Find users</p>
            </Col>
          </Form.Row>
          <Form.Row className="align-items-center">
            <Col xs="12">
              <Form.Label htmlFor="inlineFormInput" srOnly>
                Username
              </Form.Label>
              <Form.Control
                onChange={(e) => {
                  setSearchField(e.target.value);
                }}
                className="mb-2"
                id="inlineFormInput"
                placeholder="Username"
              />
              <Spinner
                animation="border"
                size="sm"
                style={{
                  display: loading ? "block" : "none",
                  float: "right",
                  marginTop: "-34px",
                  marginRight: "10px",
                }}
              />
            </Col>
          </Form.Row>
        </Form>
        <div
          style={{ marginTop: "20px", height: "190px", overflowY: "scroll" }}
        >
          <ListGroup>
            {resultUsers.map((x) => {
              return searchUsers(x);
            })}
          </ListGroup>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="primary"
          disabled={!canCreate}
          onClick={() => {
            createButtonPressed();
           
          }}
        >
          Create
        </Button>
      </Modal.Footer>
    </Modal>
    // <View>
    //   <FlatList
    //     style={styles.mainList}
    //     data={[0]}
    //     renderItem={mainElementList}
    //     keyExtractor={(item) => '0'}></FlatList>
    // </View>
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

const ConnectedCreateGroupChatScreen = connect(
  mapStateToProps,
  mapDispatchToProps
)(CreateGroupChatScreen);

export default ConnectedCreateGroupChatScreen;
