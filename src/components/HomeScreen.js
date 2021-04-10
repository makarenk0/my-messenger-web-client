import React, { useState, useEffect } from "react";

import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { showModal, hideModal } from "../actions/ModalActions";
import ChatScreen from './ChatScreen';
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
import { Button } from "react-bootstrap";
import SlidingPane from "react-sliding-pane";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "react-sliding-pane/dist/react-sliding-pane.css";
import logo from "../images/logoLoader.png";

import ChatRepresenter from "./ChatRepresenter";

const HomeScreen = (props) => {
  const [allChats, setAllChats] = useState([]);
  const [isPaneOpen, setPane] = useState(false);
  const [currentOpendChat, setCurrentChat] = useState("");

  const addNewChatToDB = (chat) => {
    let newMessages = chat.NewMessages;
    props.saveDocToDB(
      {
        _id: chat.ChatId,
        ChatName: chat.ChatName,
        Members: chat.Members,
        Messages: chat.NewMessages,
        NewMessagesNum: newMessages.length,
        IsGroup: chat.IsGroup,
        LastMessageId: newMessages[newMessages.length - 1]._id,
      },
      (err, newDoc) => {}
    );

    console.log("New chat in DB");
    //updating array with existing chats ids
    props.addOneToArray(
      "localChatsIds",
      "ChatIds",
      chat.ChatId,
      (err, docs) => {
        //console.log(err);
        //console.log(docs);
      }
    );
  };

  const updateExistingChatInDB = (chat) => {
    let newMessages = chat.NewMessages;
    //adding all new messages to messages array
    console.log("adding all new messages to messages array");

    let addMessagesPromise = new Promise((resolve, reject) => {
      props.addManyToArray(chat.ChatId, "Messages", newMessages, () => {
        resolve();
      });
    });
    addMessagesPromise.then(() => {
      let getCurrentMessagesNumPromise = new Promise((resolve, reject) => {
        props.getProjected(chat.ChatId, ["NewMessagesNum"], (el) => {
          resolve(el);
        });
      });

      getCurrentMessagesNumPromise.then((newElement) => {
        //updating "LastMessageId" field
        props.updateValue(
          chat.ChatId,
          {
            NewMessagesNum: newElement[0].NewMessagesNum + newMessages.length,
            LastMessageId: newMessages[newMessages.length - 1]._id,
          },
          () => {
            console.log("New messages counter updated");
          }
        );
      });
    });
  };

  const updateAllChatsToDisplay = (local, updated) => {
    // updating "allChats" array which is used to display chats
    // increasing new messages counter
    local = local.map((x) => {
      let update = updated.find((y) => y.chatId == x.chatId);
      if (typeof update !== "undefined") {
        //update counter only in case there is an update
        x.newMessagesNum += update.newMessagesNum;
      }
      return x;
    });

    //adding new chats
    let newChats = updated.filter((x) => x.isNew);
    local.unshift(...newChats);

    //applying changes
    console.log("Changing all chats data to display");
    setAllChats(local);
  };

  useEffect(() => {
    props.subscribeToUpdate(5, "homescreen", (data) => {
      console.log(data);
      console.log(data.IsNew);
      if (data.IsNew) {
        console.log("Adding new chat in real-time");
        addNewChatToDB(data);
      } else {
        console.log("Updating existing chat in real-time");
        updateExistingChatInDB(data);
      }
      let ChatRepresentorsUpdatedData = [];
      ChatRepresentorsUpdatedData.push({
        chatId: data.ChatId,
        chatName: data.ChatName,
        chatMembers: data.Members,
        isNew: data.IsNew,
        isGroup: data.IsGroup,
        newMessagesNum: data.NewMessages.length,
      });
      updateAllChatsToDisplay(allChats, ChatRepresentorsUpdatedData);
    });
  }, [allChats]);

  const zeroPacketRequest = (LastChatsMessages, ChatRepresentorsLocalData) => {
    let ChatRepresentorsUpdatedData = []; // this array will be a response data for "LastChatsMessages" array

    let regObj = {
      SessionToken: props.connectionReducer.connection.current.sessionToken,
      SubscriptionPacketNumber: "5", //packet number which server will use for real-time update
      LastChatsMessages: LastChatsMessages,
    };

    //after "LastChatsMessages" array formed - send it to server and subscribe for real-time update on packet number 5
    props.sendDataToServer(7, true, regObj, (response) => {
      if (response.Status == "error") {
        //in case of some error
        console.log(response.Details);
      } else {
        //in case of success

        // going through server response array of new messages and new chats(if there are such)
        response.AllChats.forEach((element) => {
          if (element.IsNew) {
            addNewChatToDB(element); //adding new chat to database
          } else {
            updateExistingChatInDB(element); //update existing chat in DB
          }
          // --------------------------

          // pushing new data to "ChatRepresentorsUpdatedData" array
          ChatRepresentorsUpdatedData.push({
            chatId: element.ChatId,
            chatName: element.ChatName,
            chatMembers: element.Members,
            isNew: element.IsNew,
            isGroup: element.IsGroup,
            newMessagesNum: element.NewMessages.length,
          });
          // -----------------------
        });
      }

      updateAllChatsToDisplay(
        ChatRepresentorsLocalData,
        ChatRepresentorsUpdatedData
      );
    });
  };

  useEffect(() => {
    props.loadDB("localDB");

    let localChatsRes;
    props.loadDocFromDB("localChatsIds", (docs) => {
      localChatsRes = docs;
    });
    console.log(localChatsRes);
    if (localChatsRes.length == 0) {
      let initChats = new Promise((resolve, reject) => {
        props.saveDocToDB({ _id: "localChatsIds", ChatIds: [] }, () => {
          console.log("Local chats initialized");
          resolve();
        });
      });
      initChats.then(() => {
        zeroPacketRequest([], []);
      });
    } else {
      if (localChatsRes[0].ChatIds.length == 0) {
        zeroPacketRequest([], []);
      } else {
        let LastChatsMessages = []; //this array will be send to server and server will determine which new messages do you need (or new chats)
        var ChatRepresentorsLocalData = []; // this array is formed with data of chats which are stored locally

        localChatsRes[0].ChatIds.forEach((chatId) => {
          console.log(chatId);

          //we need only projections (Only "LastMessageId" field, "ChatName" field and "Members" field )
          props.getProjected(
            chatId,
            [
              "LastMessageId",
              "ChatName",
              "Members",
              "NewMessagesNum",
              "IsGroup",
            ],
            (lastMessageId) => {
              //pushing data from db to array
              ChatRepresentorsLocalData.push({
                chatId: chatId,
                chatName: lastMessageId[0].ChatName,
                chatMembers: lastMessageId[0].Members,
                isGroup: lastMessageId[0].IsGroup,
                newMessagesNum: lastMessageId[0].NewMessagesNum, //TO DO: create a field of number of new messages in db
              });
              //pushing "ChatId" and "LastMessageId" to array which will be send to server
              LastChatsMessages.push({
                ChatId: chatId,
                LastMessageId: lastMessageId[0].LastMessageId,
              });
            }
          );
          //--------------------------------------------------------------------------------------------
        });
        // waiting for all requests are completed on database

        zeroPacketRequest(LastChatsMessages, ChatRepresentorsLocalData);
      }
    }
  }, []);

  // in case of chat is pressed (navigating to "ChatScreen" and passing chatId )
  const chatPressed = (chatId, chatName) => {
    setCurrentChat(chatId)
    // props.navigation.navigate("ChatScreen", {
    //   chatId: chatId,
    //   chatName: chatName,
    // });
  };

  return (
    <div className="homeScreenContainer">
      <SlidingPane
        className="some-custom-class"
        overlayClassName="some-custom-overlay-class"
        isOpen={isPaneOpen}
        from="left"
        width="300px"
        onRequestClose={() => {
          // triggered on "<" on left top click or on outside click
          setPane(false);
        }}
      >
        <Button
          onClick={() => {
            localStorage.clear();
          }}
        >
          Log out
        </Button>
      </SlidingPane>
      <div className="chatsPanel">
        <div className="topPanel">
          <Button
            className="slidePaneButton"
            variant="primary"
            style={{
              borderRadius: "20px",
              height: "40px",
              width: "40px",
              marginLeft: "10px",
              marginTop: "5px",
            }}
            onClick={() => {
              setPane(true);
            }}
          >
            <FontAwesomeIcon
              icon="bars"
              size="lg"
              className="fontAwesomeIcon"
              style={{ marginLeft: "-2px" }}
            />
          </Button>
          <div className="appName">
            <p>My Messenger</p>
          </div>
          <div className="appLogo">
            <img src={logo} className="homeScreenLogo"></img>
          </div>
        </div>
        {allChats.map((x) => (
          <ChatRepresenter
            key={x.chatId}
            chatId={x.chatId}
            chatName={x.chatName}
            newMessagesNum={x.newMessagesNum}
            isGroup={x.isGroup}
            isSelected={x.chatId === currentOpendChat}
            onPress={chatPressed}
          ></ChatRepresenter>
        ))}
      </div>

      <div className="chatScreen">
          {currentOpendChat === "" ? null : <ChatScreen chatId={currentOpendChat}></ChatScreen>}
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  const { connectionReducer, ModalReducer, localDBReducer } = state;
  return {
    ModalReducer,
    connectionReducer,
    localDBReducer,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      hideModal,
      showModal,
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

const ConnectedHomeScreen = connect(
  mapStateToProps,
  mapDispatchToProps
)(HomeScreen);

export default ConnectedHomeScreen;
