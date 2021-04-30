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
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { SEARCH_USERS_WAIT_TIMEOUT } from "../configs";

const GroupChatAdminPanel = (props) => {
  const [searchField, setSearchField] = useState("");
  const [chatName, setChatName] = useState("");
  const [chatUsers, setChatUsers] = useState([]);
  const [resultUsers, setResultUsers] = useState([]);
  const [userInputTimer, setUserInputTimer] = useState("");
  const [loading, setLoading] = useState(false);
  const [canLeave, setCanLeave] = useState(false);

  useEffect(() => {
    setChatName(props.chatName);
    setResultUsers([]);
  }, [props.chatName]);

  useEffect(() => {
    setChatUsers(props.membersInfo);
  }, [props.membersInfo]);

  useEffect(() => {
    if (chatUsers.length == 1) {
      setCanLeave(true);
    } else {
      setCanLeave(false);
    }
  }, [chatUsers]);

  const isEmptyOrSpaces = (str) => {
    return str === null || str.match(/^ *$/) !== null;
  };

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
      <ListGroup.Item key={item.UserId}>
        <div
          style={{ display: "grid", gridTemplateColumns: "60px 200px auto" }}
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

          <div style={{ marginTop: "-4px" }}>
            <p style={{ marginBottom: 0 }}>{fullname}</p>
            <p style={{ marginBottom: 0, fontWeight: "600" }}>
              {"@"}
              {item.Login}
            </p>
          </div>
          <div
            style={
              item.UserId ===
              props.connectionReducer.connection.current.currentUser.UserId
                ? { display: "none" }
                : { display: "block" }
            }
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "auto auto",
                width: "100px",
                marginLeft: "80%",
              }}
            >
              <Button
                variant="light"
                onClick={() => {
                  kickMember(item.UserId, fullname);
                }}
              >
                <FontAwesomeIcon
                  icon={"user-times"}
                  size="1x"
                  className="fontAwesomeIcon"
                />
              </Button>
              <Button
                variant="light"
                style={{ marginLeft: "10px" }}
                onClick={() => {
                  transferAdminRights(item.UserId);
                }}
              >
                <FontAwesomeIcon
                  icon={"users-cog"}
                  size="1x"
                  className="fontAwesomeIcon"
                />
              </Button>
            </div>
          </div>
        </div>
      </ListGroup.Item>
    );
  };

  const userToAddPressed = (userId, userName) => {
    let user = resultUsers.find((x) => x.UserId == userId);

    let sendObj = {
      EventType: 3,
      ChatId: props.chatId,
      EventData: {
        UserId: userId,
      },
    };
    props.sendDataToServer("p", true, sendObj, (response) => {
      if (response.Status === "success") {
      } else {
        console.log(response);
      }
    });

    setChatUsers([...chatUsers, user]);

    let all = resultUsers;
    console.log(userId);
    all = all.filter((x) => x.UserId != userId);
    console.log(all);
    setResultUsers(all);
  };

  const transferAdminRights = (userId) => {
    let sendObj = {
      EventType: 4,
      ChatId: props.chatId,
      EventData: {
        UserId: userId,
      },
    };
    props.sendDataToServer("p", true, sendObj, (response) => {
      if (response.Status === "success") {
        props.onClose(false);
      } else {
        console.log(response);
      }
    });
  };

  const kickMember = (userId, userName) => {
    let users = chatUsers;
    let sendObj = {
      EventType: 2,
      ChatId: props.chatId,
      EventData: {
        UserId: userId,
      },
    };
    props.sendDataToServer("p", true, sendObj, (response) => {
      if (response.Status === "success") {
      } else {
        console.log(response);
      }
    });

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
        <OverlayTrigger
          overlay={
            <Tooltip id={"leave-tooltip"}>
              Transfer your admin rights to someone to leave the chat
            </Tooltip>
          }
        >
          <div>
            <Button
              variant="danger"
              disabled={!canLeave}
              onClick={() => {
                props.leaveChat();
                props.onClose(false);
              }}
              style={{pointerEvents: "none"}}
            >
              Leave chat
            </Button>
          </div>
        </OverlayTrigger>
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

const ConnectedGroupChatAdminPanel = connect(
  mapStateToProps,
  mapDispatchToProps
)(GroupChatAdminPanel);

export default ConnectedGroupChatAdminPanel;
