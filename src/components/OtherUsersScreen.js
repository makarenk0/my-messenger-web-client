import React, { useState, useEffect } from "react";

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

import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {
  connectToServer,
  sendDataToServer,
  subscribeToUpdate,
} from "../actions/ConnectionActions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
  loadDocWithParams
} from "../actions/LocalDBActions";
import { SEARCH_USERS_WAIT_TIMEOUT } from "../configs";
//import {isEmptyOrSpaces} from "/Utilities";

const OtherUsersScreen = (props) => {
  const [searchField, setSearchField] = useState("");
  const [resultUsers, setResultUsers] = useState([]);
  const [userInputTimer, setUserInputTimer] = useState("");
  const [loading, setLoading] = useState(false);

  const isEmptyOrSpaces = (str) => {
    return str === null || str.match(/^ *$/) !== null;
  };

  const loadLocalContacts = () => {
    // props.loadDocFromDB({Type: 'localUser'}, (err, docs) => {
    //   let localContacts = docs.filter(x => x.UserId != props.connectionReducer.connection.current.currentUser.UserId)
    //   setResultUsers(localContacts)
    // })
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
          setResultUsers(response.Users);
        } else {
          console.log(response.Status);
          console.log(response.Details);
        }
      });
    } else {
      loadLocalContacts();
    }
  };

  const renderItem = (item) => {
    let fullname = item.FirstName + " " + item.LastName
    return (
      <ListGroup.Item key={item.UserId} onClick={() => {userPressed(item.UserId, fullname)}}>
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
          <p style={{ marginBottom: 0 }}>
            {fullname}
          </p>
          <p style={{ marginBottom: 0 }}>
            {"@"}
            {item.Login}
          </p>
        </div>
      </ListGroup.Item>
      // <UserRepresenter
      //   border={true}
      //   userId={item.UserId}
      //   userFirstName={item.FirstName}
      //   userLastName={item.LastName}
      //   userLogin={item.Login}
      //   userPressed={userPressed}></UserRepresenter>
    );
  };

  const userPressed = (userId, userName) => {
    let checkIfExistPromise = new Promise((resolve, reject) => {
      props.loadDocWithParams({ChatName: userName}, (docs) => {
       resolve(docs)
      })
    })
    checkIfExistPromise.then((docs) => {
      let chatId = 'new';
      if(docs.length > 0){
        chatId = docs[0]._id;
      }
      props.onClose(false)
      props.openChat(chatId, userName, userId)
    })
    // props.loadDocFromDB({ChatName: userName}, (err, chat) => {
    //   let chatId = 'new';
    //   console.log(chat)
    //   if (chat.length > 0) {
    //     console.log(chat)
    //     chatId = chat[0]._id;
    //   }
    //   props.navigation.navigate('ChatScreen', {
    //     chatId: chatId,
    //     userId: userId,
    //     chatName: userName,
    //   });
    // });
  };

  return (
    <Modal show={props.showOtherUsers} onHide={() => {props.onClose(false)}} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Contacts</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Row className="align-items-center">
            <Col xs="12">
              <Form.Label htmlFor="inlineFormInput" srOnly>
                Name
              </Form.Label>
              <Form.Control
                onChange={(e) => {
                  setSearchField(e.target.value);
                }}
                className="mb-2"
                id="inlineFormInput"
                placeholder="Username"
              />
            </Col>
            <Spinner
              animation="border"
              size="sm"
              style={{
                position: "absolute",
                top: "28px",
                right: "30px",
                display: loading ? "block" : "none",
              }}
            />
          </Form.Row>
        </Form>
        <div
          style={{ marginTop: "20px", height: "500px", overflowY: "scroll" }}
        >
          <ListGroup>
            {resultUsers.map((x) => {
              return renderItem(x);
            })}
          </ListGroup>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => {}}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
    // <View>
    //   <View style={{height: 55, width: "100%", backgroundColor: "#1597bb", flexDirection: "row"}}>
    //   <Button
    //     style={{borderRadius: 25}}
    //     containerStyle={{width: 50, marginTop: 5, marginLeft: 5, height: 45, borderRadius: 25}}
    //     buttonStyle={{backgroundColor: "#1597bb", borderRadius: 25}}
    //     icon={
    //       <FontAwesomeIcon
    //       icon={faBars}
    //       size={25}
    //       style={{marginTop: 2}}
    //       onPress={() =>{props.navigation.openDrawer()}}
    //     />
    //     }
    //   />
    //   <Text style={{fontSize: 22, textAlignVertical:"center", paddingLeft: 10}}>Contacts</Text>
    //   </View>
    //   <SearchBar
    //     lightTheme
    //     style={styles.searchField}
    //     placeholder="Enter user login or name"
    //     onChangeText={setSearchField}
    //     value={searchField}
    //     showLoading={loading}
    //     loadingProps={{
    //       animating: true,
    //       color: 'black',
    //     }}></SearchBar>
    //   <FlatList
    //     style={styles.usersThread}
    //     data={resultUsers}
    //     renderItem={renderItem}
    //     keyExtractor={(item) => item.UserId}></FlatList>
    // </View>
  );
};

// const styles = StyleSheet.create({
//   searchField: {
//     alignSelf: 'center',
//     width: '90%',
//   },
// });

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
      loadDocWithParams,
    },
    dispatch
  );

const ConnectedOtherUsersScreen = connect(
  mapStateToProps,
  mapDispatchToProps
)(OtherUsersScreen);

export default ConnectedOtherUsersScreen;
