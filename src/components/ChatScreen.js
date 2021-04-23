import React, { useState, useEffect, useRef, useFocus } from "react";

import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { showModal, hideModal } from "../actions/ModalActions";
import {
  connectToServer,
  sendDataToServer,
  subscribeToUpdate,
  unsubscribeFromUpdate,
} from "../actions/ConnectionActions";

import { Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  saveDocToDB,
  loadDocFromDB,
  removeDocFromDB,
  addOneToArray,
  addManyToArray,
  removeFromArray,
  removeManyFromArray,
  getProjected,
  updateValue,
} from "../actions/LocalDBActions";

import MyMessage from "./MessageContainers/MyMessage";
import SystemMessage from "./MessageContainers/SystemMessage";
import OtherUserPublicMessage from "./MessageContainers/OtherUserPublicMessage";
import OtherUserPrivateMessage from "./MessageContainers/OtherUserPrivateMessage";
import GroupChatAdminPanel from "./GroupChatAdminPanel";
import GroupChatMemberPanel from "./GroupChatMemberPanel";
import assistantLogo from "../images/assistant_logo.jpg";

const ChatScreen = (props) => {
  console.log("chat opened");
  const chatId = props.chatId;
  const [toSend, setSendMessage] = useState("");
  const [allMessages, setAllMessages] = useState([]);
  const [chatName, setChatName] = useState("");
  const [reRenderFlag, setRerenderFlag] = useState(true);
  const [isGroup, setGroupFlag] = useState(false);

  const [membersInfo, setMembersInfo] = useState([]);
  const [removedMembersInfo, setRemovedMembersInfo] = useState([]);

  const [selectedMessagesNum, setSelectedMessagesNum] = useState(0);
  const [isAssistant, setAssistantFlag] = useState(false);
  const [groupChatPanelShow, setGroupChatPanelShow] = useState(false);
  const messagesEnd = useRef(null);


  const scrollToBottom = (scrollType) => {
    messagesEnd.current?.scrollIntoView({ behavior: scrollType });
  };

  //load members list
  const getAllMembers = (members) => {
    console.log("members");
    console.log(members);
    var membersAbsentLocally = [];
    var membersPresentLocally = [];

    let promises = [];
    members.forEach((x) => {
      console.log("member iterate");
      promises.push(
        new Promise((resolve, reject) => {
          props.loadDocFromDB(x, (doc) => {
            console.log(doc.length);
            if (doc.length > 0) {
              console.log("User info loaded locally");
              membersPresentLocally.push(doc[0]);
            } else {
              console.log(x);
              membersAbsentLocally.push(x);
            }
            resolve("done");
          });
        })
      );
    });
    Promise.all(promises).then((res) => {
      if (membersAbsentLocally.length != 0) {
        let finUsersObj = {
          SessionToken: props.connectionReducer.connection.current.sessionToken,
          UserIds: membersAbsentLocally,
        };
        console.log(finUsersObj);
        props.sendDataToServer("3", true, finUsersObj, (response) => {
          if (response.Status == "success") {
            setMembersInfo([
              //...membersInfo,
              ...response.Users,
              ...membersPresentLocally,
            ]);

            response.Users.forEach((x) => {
              x["Type"] = "localUser";
              x["_id"] = x.UserId;
              props.saveDocToDB(x, () => {});
            });
          } else {
            console.log(response.Status);
            console.log(response.Details);
          }
        });
      } else {
        setMembersInfo([...membersPresentLocally]);
      }
    });
  };

  useEffect(() => {
    let removedMembersIds = allMessages
      .filter((x) => {
        return (
          x.Sender != "System" &&
          x.Sender != "assistant" &&
          membersInfo.findIndex((y) => y.UserId === x.Sender) == -1
        );
      })
      .map((x) => x.Sender);
    let uniqueMembers = [...new Set(removedMembersIds)];
    if (uniqueMembers.length > 0) {
      getRemovedMembersInfo(uniqueMembers);
    }
  }, [membersInfo]);

  // useEffect(() => {
  //   console.log(membersInfo);
  //   setRerenderFlag(!reRenderFlag);
  // }, [membersInfo]);

  const sendMessage = () => {
    if (!isEmptyOrSpaces(toSend)) {
      setSendMessage("");
      if (chatId != "new") {
        let sendObj = {
          SessionToken: props.connectionReducer.connection.current.sessionToken,
          ChatId: chatId,
          Body: toSend,
        };
        props.sendDataToServer(
          isAssistant ? "a" : "4",
          true,
          sendObj,
          (response) => {
            console.log(response);
            // setAllMessages([response, ...allMessages])
            // setRerenderFlag(!reRenderFlag)
          }
        );
      } else {
        let sendObj = {
          SessionToken: props.connectionReducer.connection.current.sessionToken,
          UserIds: [
            props.newUserId,
            props.connectionReducer.connection.current.currentUser.UserId,
          ],
          Body: toSend,
        };
        props.sendDataToServer("6", true, sendObj, (response) => {
          //only for private chats
          console.log(response);
          props.setChatId(response.ChatId);
          setAllMessages([...response.NewMessages, ...allMessages]);
        });
      }
    }
    //inputField.input.focus()
  };

  const isEmptyOrSpaces = (str) => {
    return str === null || str.match(/^ *$/) !== null;
  };

  //getting chat data
  useEffect(() => {
    let getChatPromise = new Promise((resolve, reject) => {
      props.loadDocFromDB(chatId, (docs) => {
        if (docs.length > 0) {
          let chat = docs[0];
          resolve(chat);
        }
        reject();
      });
    });
    getChatPromise
      .then((chat) => {
        setAllMessages(
          chat.Messages.map((x) => {
            x["isSelected"] = false;
            return x;
          })
        );
        setGroupFlag(chat.IsGroup);
        getAllMembers(chat.Members);
        setChatName(chat.ChatName);
        setAssistantFlag(
          chatId ===
            props.connectionReducer.connection.current.currentUser
              .AssistantChatId
        );
      })
      .catch(() => {
        setAllMessages([]);
        setChatName(props.chatName);
      });
      //inputField.focus()
  }, [props.chatId]);

  // TO DO: complete for new users or admin change
  useEffect(() => {
    props.subscribeToUpdate("5", "chatscreen", (data) => {
      if (data.ChatId == chatId) {
        let newMessages = data.NewMessages.map((x) => {
          x["isSelected"] = false;
          return x;
        });
        if (data.Members != null) {
          console.log("DATA CHAT MEMBERS:");
          getAllMembers(data.Members);
        }
        setAllMessages([...allMessages, ...newMessages]);
        setRerenderFlag(!reRenderFlag);
        scrollToBottom("smooth");
      }
    });
  }, [allMessages]);

  const messageOnClick = (messageId) => {
    let index = allMessages.findIndex((x) => x._id === messageId);

    if (index !== -1) {
      console.log(index);
      let messages = allMessages;
      let previousState = messages[index].isSelected;
      messages[index].isSelected = !previousState;
      if (previousState) {
        setSelectedMessagesNum(selectedMessagesNum - 1);
      } else {
        setSelectedMessagesNum(selectedMessagesNum + 1);
      }
      setAllMessages(messages);
    }
  };

  const deleteMessages = () => {
    filterDisplayMessages();
    deleteMessagesFromStorage();
  };

  const filterDisplayMessages = () => {
    let filtered = allMessages.filter((x) => {
      return !x.isSelected;
    });
    setAllMessages(filtered);
  };

  const deleteMessagesFromStorage = () => {
    let idsToDelete = allMessages.filter((x) => x.isSelected).map((x) => x._id);
    props.removeManyFromArray(chatId, "Messages", "_id", idsToDelete, () => {});
    setSelectedMessagesNum(0);
  };

  useEffect(() => {
    scrollToBottom("auto");
  }, [chatName]);

  const getRemovedMembersInfo = (ids) => {
    let finUsersObj = {
      SessionToken: props.connectionReducer.connection.current.sessionToken,
      UserIds: ids,
    };
    console.log(finUsersObj);
    props.sendDataToServer("3", true, finUsersObj, (response) => {
      if (response.Status == "success") {
        setRemovedMembersInfo([...response.Users]);
      } else {
        console.log(response.Status);
        console.log(response.Details);
      }
    });
  };

  const renderItem = (x) => {
    console.log(x.isSelected);

    if (
      props.connectionReducer.connection.current.currentUser.UserId === x.Sender
    ) {
      return (
        <MyMessage
          key={x._id}
          id={x._id}
          body={x.Body}
          messageOnClick={messageOnClick}
        />
      );
    } else if (x.Sender == "System") {
      return <SystemMessage key={x._id} id={x._id} body={x.Body} />;
    } else if (isGroup) {
      console.log("IN GROUP");
      // let memberInfo = findSenderInfo(x.Sender)

      let memberInfoIndex = membersInfo.findIndex((y) => y.UserId == x.Sender);
      let memberInfo;
      if (memberInfoIndex != -1) {
        memberInfo = membersInfo[memberInfoIndex];
      } else {
        let removedMemberInfoIndex = removedMembersInfo.findIndex(
          (y) => y.UserId == x.Sender
        );
        memberInfo = removedMembersInfo[removedMemberInfoIndex];
      }

      let senderName =
        memberInfo == null
          ? ""
          : memberInfo.FirstName + " " + memberInfo.LastName;
      return (
        <OtherUserPublicMessage
          key={x._id}
          id={x._id}
          senderName={senderName}
          body={x.Body}
          messageOnClick={messageOnClick}
        />
      );
    } else {
      return (
        <OtherUserPrivateMessage
          key={x._id}
          id={x._id}
          body={x.Body}
          messageOnClick={messageOnClick}
        />
      );
    }

    // return (
    //   <MessageBox
    //     _id={x._id}
    //     key={x._id}
    //     messageOnClick={messageOnClick}
    //     body={x.Body}
    //     isMine={props.connectionReducer.connection.current.currentUser.UserId == x.Sender}
    //     isSystem={x.Sender == "System"}
    //     isGroup={isGroup}
    //     isSelected={selectedMessages.findIndex(y => y._id === x._id) !== -1}
    //     memberName={
    //       memberInfo == null
    //         ? ""
    //         : memberInfo.FirstName + " " + memberInfo.LastName
    //     }
    //     timestamp={decapsulateDateFromId(x._id)}
    //   ></MessageBox>
    //);
  };

  // const ChatThreadSeparator = (item) =>{

  //   const index = 0//allMessages.findIndex(x => x._id == item.leadingItem._id)   //disabled
  //   let sameDate = true
  //   if(index > 0){
  //     const currentMessageTime = decapsulateDateFromId(item.leadingItem._id)
  //     var nextMessageTime = decapsulateDateFromId(allMessages[index - 1]._id)
  //     sameDate = currentMessageTime.getDate() == nextMessageTime.getDate() &&
  //     currentMessageTime.getMonth() == nextMessageTime.getMonth()
  //   }

  //   return(
  //     !sameDate ?
  //     <View style={{
  //       alignItems: "center",
  //       paddingTop: 10,
  //       paddingBottom: 10,
  //     }}>
  //       <Text style={{
  //       backgroundColor: "#009688",
  //       borderRadius: 5,
  //       paddingLeft: 8,
  //       paddingRight: 8,
  //     }}>{nextMessageTime.toDateString()}</Text>
  //     </View> : null
  //   )
  // }

  const chatEndRiched = () => {
    console.log("end reached");
  };

  const displayPublicChatInfo = () => {
    setGroupChatPanelShow(!groupChatPanelShow);
  };

  const leavePublicChat = () => {
    let sendObj = {
      EventType: 1,
      ChatId: chatId,
      EventData: {},
    };
    props.sendDataToServer("p", true, sendObj, (response) => {
      if (response.Status === "success") {
        
        let removeChatPromise = new Promise((resolve, reject) => {
          props.removeDocFromDB(chatId, () => {
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
            let updatedLocalChatIds = data[0].ChatIds.filter((x) => x != chatId);
            props.saveDocToDB({ _id: "localChatsIds", ChatIds: updatedLocalChatIds }, () => {});
          });
        })
        props.onLeaveChat();
      } else {
        console.log(response);
      }
    });
  };

  return (
    <div style={chatId == null ? { display: "none" } : { display: "block" }}>
      {props.isAdmin ? (
        <GroupChatAdminPanel
          chatId={props.chatId}
          chatName={chatName}
          membersInfo={membersInfo}
          showPublicChats={groupChatPanelShow}
          leaveChat={leavePublicChat}
          onClose={(flag) => {
            setGroupChatPanelShow(flag);
          }}
        />
      ) : (
        <GroupChatMemberPanel
          chatId={props.chatId}
          chatName={chatName}
          membersInfo={membersInfo}
          showPublicChats={groupChatPanelShow}
          leaveChat={leavePublicChat}
          onClose={(flag) => {
            setGroupChatPanelShow(flag);
          }}
        />
      )}

      <div className="chatHeader">
        <div className="iconContainer">
          <div
            style={{
              marginTop: "5px",
              marginLeft: "15px",
              borderRadius: "25px",
              backgroundColor: "#CCCCCC",
              width: "50px",
              height: "50px",
            }}
          >
            {isAssistant ? <img src={assistantLogo} style={{width: "50px", borderRadius: "25px"}}/>:
            <FontAwesomeIcon
              icon={isGroup ? "users" : "user"}
              size="2x"
              className="fontAwesomeIcon"
            />}
          </div>
        </div>
        <div className="chatName">
          <p>{chatName}</p>
        </div>
        <div>
          <div className="headerButtons">
            <Button
              style={{ display: isGroup ? "block" : "none" }}
              onClick={displayPublicChatInfo}
            >
              Info
            </Button>
            <Button
              style={{ display: selectedMessagesNum > 0 ? "block" : "none" }}
              onClick={deleteMessages}
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
      <div className="messageThread">
        {allMessages.map((x) => {
          return renderItem(x);
        })}
        <div key={"anchor"} ref={messagesEnd}></div>
      </div>
      <div className="sendMessageBox">
        <input
          placeholder="Enter your message"
          value={toSend}
          ref={input => input && input.focus()}
          onKeyDown={(e) => {
            if(e.key == 'Enter'){
              sendMessage();
            }
          }}
          onChange={(e) => {
            setSendMessage(e.target.value);
          }}
        ></input>
        <div>
          <Button
            className="sendButton"
            variant="primary"
            style={{
              borderRadius: "22px",
              height: "45px",
              width: "45px",
              marginLeft: "10px",
              marginTop: "5px",
            }}
            onClick={() => {
              sendMessage();
            }}
          >
            <FontAwesomeIcon
              icon="paper-plane"
              size="lg"
              className="fontAwesomeIconSend"
              style={{ marginLeft: "-3px" }}
            />
          </Button>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  const { connectionReducer, ModalReducer } = state;
  return {
    ModalReducer,
    connectionReducer,
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
      loadDocFromDB,
      saveDocToDB,
      removeDocFromDB,
      removeManyFromArray,
      addOneToArray,
      addManyToArray,
      removeFromArray,
      getProjected,
      updateValue,
    },
    dispatch
  );

const ConnectedChatScreen = connect(
  mapStateToProps,
  mapDispatchToProps
)(ChatScreen);

export default ConnectedChatScreen;
