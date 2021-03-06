import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";

import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { showModal, hideModal } from "../actions/ModalActions";
import ChatScreen from "./ChatScreen";
import {
  connectToServer,
  sendDataToServer,
  subscribeToUpdate,
  unsubscribeFromUpdate,
  closeWebsocketConnection,
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
import { Button, Modal } from "react-bootstrap";
import SlidingPane from "react-sliding-pane";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "react-sliding-pane/dist/react-sliding-pane.css";
import logo from "../images/logoLoader.png";

import ChatRepresenter from "./ChatRepresenter";
import OtherUsersScreen from "./OtherUsersScreen";
import CreateGroupChatScreen from "./CreateGroupChatScreen";
import SlidingPaneContent from "./SlidingPaneContent";

const HomeScreen = (props) => {
  const [allChats, setAllChats] = useState([]);
  const [isPaneOpen, setPane] = useState(false);
  const [currentOpendChat, setCurrentChat] = useState("");
  const [newUserId, setNewUserId] = useState("");

  const [chatName, setChatName] = useState("");

  const [showOtherUsers, setShowOtherUsers] = useState(false);
  const [showPublicChats, setShowPublicChats] = useState(false);

  let history = useHistory();

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
        Admin: chat.Admin,
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
        console.log("Current chat:");
        console.log(currentOpendChat);
        console.log("Chat update on:");
        console.log(chat.ChatId);

        let updateChatObj = {
          NewMessagesNum:
            currentOpendChat !== chat.ChatId
              ? newElement[0].NewMessagesNum + newMessages.length
              : 0,
          LastMessageId: newMessages[newMessages.length - 1]._id,
        };
        if (chat.Admin !== null) updateChatObj["Admin"] = chat.Admin;
        if (chat.Members !== null) {
          //removing chat if we were kicked(server won't send update to us on this chat)
          if (
            !chat.Members.includes(
              props.connectionReducer.connection.current.currentUser.UserId
            )
          ) {

            let removeChatPromise = new Promise((resolve, reject) => {
              props.removeDocFromDB(chat.ChatId, () => {
                resolve()
              });
            })
            removeChatPromise.then(() => {
              let loadPresentChats = new Promise((resolve, reject) => {
                props.loadDocFromDB("localChatsIds", (docs) => {
                  resolve(docs);
                });
              });
              loadPresentChats.then((data) => {
                let updatedLocalChatIds = data[0].ChatIds.filter((x) => x != chat.ChatId);
                props.saveDocToDB({ _id: "localChatsIds", ChatIds: updatedLocalChatIds }, () => {});
              });
            })

            return;
          }
          updateChatObj["Members"] = chat.Members;
        }

        props.updateValue(chat.ChatId, updateChatObj, () => {
          console.log("New messages counter updated");
        });
      });
    });
  };

  const updateAllChatsToDisplay = (local, updated) => {
    // updating "allChats" array which is used to display chats
    // increasing new messages counter
    console.log(currentOpendChat);
    local = local.map((x) => {
      let update = updated.find((y) => y.chatId == x.chatId);
      if (typeof update !== "undefined") {
        //update counter only in case there is an update
        x.newMessagesNum +=
          currentOpendChat !== x.chatId ? update.newMessagesNum : 0;
        if (update.admin !== null) x.admin = update.admin;
        if (update.chatMembers !== null) {
          if (!update.chatMembers.includes(props.connectionReducer.connection.current.currentUser.UserId)) {
            if(currentOpendChat == update.chatId) setCurrentChat(null);
            return null;
          }
          x.chatMembers = update.chatMembers;
        }
      }
      return x;
    });
    local = local.filter((x) => x != null);

    //adding new chats
    let newChats = updated.filter((x) => x.isNew);

    let currentChatInAccount = newChats.map((x) => {
      if (x.chatName === chatName) {
        x.newMessagesNum = 0;
      }
      return x;
    })
    currentChatInAccount.forEach(x => {
      local.splice(1, 0, x);
    })
    

    //applying changes
    console.log("Changing all chats data to display");
    setAllChats(local);
  };

  useEffect(() => {
    let subscribeUpdate = new Promise((resolve, reject) => {
      props.subscribeToUpdate("5", "homescreen", (data) => {
        resolve(data);
      });
    });
    subscribeUpdate.then((data) => {
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
        admin: data.Admin,
        newMessagesNum: data.NewMessages.length,
      });
      updateAllChatsToDisplay(allChats, ChatRepresentorsUpdatedData);
    });
  }, [allChats, currentOpendChat]);

  const zeroPacketRequest = (LastChatsData, ChatRepresentorsLocalData) => {
    let ChatRepresentorsUpdatedData = []; // this array will be a response data for "LastChatsMessages" array

    let regObj = {
      SessionToken: props.connectionReducer.connection.current.sessionToken,
      SubscriptionPacketNumber: "5", //packet number which server will use for real-time update
      LastChatsData: LastChatsData,
    };

    //after "LastChatsMessages" array formed - send it to server and subscribe for real-time update on packet number 5
    props.sendDataToServer("7", true, regObj, (response) => {
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
            admin: element.Admin,
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

    //let localChatsRes;
    let loadPresentChats = new Promise((resolve, reject) => {
      props.loadDocFromDB("localChatsIds", (docs) => {
        resolve(docs);
      });
    });
    loadPresentChats.then((localChatsRes) => {
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
      } else if (localChatsRes[0].ChatIds.length == 0) {
        zeroPacketRequest([], []);
      } else {
        let LastChatsData = []; //this array will be send to server and server will determine which new messages do you need (or new chats)
        var ChatRepresentorsLocalData = []; // this array is formed with data of chats which are stored locally

        localChatsRes[0].ChatIds.forEach((chatId) => {
          //we need only projections (Only "LastMessageId" field, "ChatName" field and "Members" field )
          props.getProjected(
            chatId,
            [
              "LastMessageId",
              "ChatName",
              "Members",
              "NewMessagesNum",
              "IsGroup",
              "Admin",
            ],
            (lastMessageId) => {
              //pushing data from db to array
              ChatRepresentorsLocalData.push({
                chatId: chatId,
                chatName: lastMessageId[0].ChatName,
                chatMembers: lastMessageId[0].Members,
                isGroup: lastMessageId[0].IsGroup,
                admin: lastMessageId[0].Admin,
                newMessagesNum: lastMessageId[0].NewMessagesNum, //TO DO: create a field of number of new messages in db
              });
              //pushing "ChatId" and "LastMessageId" to array which will be send to server
              LastChatsData.push({
                ChatId: chatId,
                Members: lastMessageId[0].Members,
                Admin: lastMessageId[0].Admin,
                LastMessageId: lastMessageId[0].LastMessageId,
              });
            }
          );
          //--------------------------------------------------------------------------------------------
        });
        // waiting for all requests are completed on database

        zeroPacketRequest(LastChatsData, ChatRepresentorsLocalData);
      }
    });
  }, []);

  // in case of chat is pressed (navigating to "ChatScreen" and passing chatId )
  const chatPressed = (chatId, chatName, newUserId) => {
    let backFromChatIndex = allChats.findIndex((x) => x.chatId == chatId);
    let updated = allChats;
    if (updated[backFromChatIndex] != null) {
      updated[backFromChatIndex].newMessagesNum = 0;
      setAllChats(updated);
      props.updateValue(chatId, { NewMessagesNum: 0 }, () => {});
    }
    console.log(chatId);

    setChatName(chatName);
    setCurrentChat(chatId);
    setNewUserId(newUserId);
  };

  const leaveChat = () => {
    setAllChats(allChats.filter((x) => x.chatId !== currentOpendChat));
    setCurrentChat(null);
  };

  const isAdminInOpenedChat = () => {
    let index = allChats.findIndex((x) => x.chatId === currentOpendChat);
    return index == -1
      ? false
      : allChats[index].admin ===
          props.connectionReducer.connection.current.currentUser.UserId;
  };

  return (
    <div className="homeScreenContainer">
      <OtherUsersScreen
        showOtherUsers={showOtherUsers}
        onClose={(flag) => {
          setShowOtherUsers(flag);
        }}
        openChat={chatPressed}
      />
      <CreateGroupChatScreen
        showPublicChats={showPublicChats}
        onClose={(flag) => {
          setShowPublicChats(flag);
        }}
      />
      <SlidingPane
        hideHeader={true}
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
        <SlidingPaneContent
          userInfo={props.connectionReducer.connection.current.currentUser}
          logOutOnclick={() => {
            localStorage.clear();
            props.unsubscribeFromUpdate("homescreen", (removed) => {
              console.log(removed);
            });
            props.closeWebsocketConnection();
            history.goBack();
          }}
          contactsOnClick={() => {
            setPane(false);
            setShowOtherUsers(!showOtherUsers);
          }}
          publicChatsOnClick={() => {
            setPane(false);
            setShowPublicChats(!showPublicChats);
          }}
        />
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
            isAssistant={props.connectionReducer.connection.current.currentUser.AssistantChatId === x.chatId}
          ></ChatRepresenter>
        ))}
      </div>

      <div className="chatScreen">
        {currentOpendChat === "" ? null : (
          <ChatScreen
            chatId={currentOpendChat}
            chatName={chatName}
            newUserId={newUserId}
            isAdmin={isAdminInOpenedChat()}
            setChatId={(id) => setCurrentChat(id)}
            onLeaveChat={() => leaveChat()}
          ></ChatScreen>
        )}
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
      unsubscribeFromUpdate,
      loadDB,
      saveDocToDB,
      loadDocFromDB,
      removeDocFromDB,
      addOneToArray,
      addManyToArray,
      removeFromArray,
      getProjected,
      updateValue,
      closeWebsocketConnection,
    },
    dispatch
  );

const ConnectedHomeScreen = connect(
  mapStateToProps,
  mapDispatchToProps
)(HomeScreen);

export default ConnectedHomeScreen;
