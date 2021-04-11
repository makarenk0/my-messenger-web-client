import React, { useState, useEffect } from "react";

import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { showModal, hideModal } from "../actions/ModalActions";
import {
  connectToServer,
  sendDataToServer,
  subscribeToUpdate,
  unsubscribeFromUpdate,
} from "../actions/ConnectionActions";

import {
  saveDocToDB,
  loadDocFromDB,
  removeDocFromDB,
  addOneToArray,
  addManyToArray,
  removeFromArray,
  getProjected,
  updateValue,
} from "../actions/LocalDBActions";
import MessageBox from "./MessageBox";

const ChatScreen = (props) => {
  const chatId = props.chatId;
  const [toSend, setSendMessage] = useState("");
  const [allMessages, setAllMessages] = useState([]);
  const [reRenderFlag, setRerenderFlag] = useState(true);
  const [isGroup, setGroupFlag] = useState(false);
  const [membersInfo, setMembersInfo] = useState([]);


   //load members list
   const getAllMembers = (members) => {
    console.log('members');
    console.log(members);
    var membersAbsentLocally = [];
    var membersPresentLocally = [];

    let promises = [];
    members.forEach((x) => {
      console.log('member iterate');
      promises.push(
        new Promise((resolve, reject) => {
          props.loadDocFromDB(x, (doc) => {
            console.log(doc.length);
            if (doc.length > 0) {
              console.log('User info loaded locally');
              membersPresentLocally.push(doc[0]);
            } else {
              console.log(x);
              membersAbsentLocally.push(x);
            }
            resolve('done');
          });
        }),
      );
    });
    Promise.all(promises).then((res) => {
      if (membersAbsentLocally.length != 0) {
        let finUsersObj = {
          SessionToken: props.connectionReducer.connection.current.sessionToken,
          UserIds: membersAbsentLocally,
        };
        console.log(finUsersObj);
        props.sendDataToServer(3, true, finUsersObj, (response) => {
          if (response.Status == 'success') {
            setMembersInfo([...membersInfo, ...response.Users, ...membersPresentLocally]);

            response.Users.forEach((x) => {
              x['Type'] = 'localUser'
              x['_id'] = x.UserID
              props.saveDocToDB(
               x, () => {});
            });
          } else {
            console.log(response.Status);
            console.log(response.Details);
          }
        });
      }
      else{
        setMembersInfo([...membersInfo, ...membersPresentLocally]);
      }
      
    });
  };

  // useEffect(() => {
  //   console.log(membersInfo);
  //   setRerenderFlag(!reRenderFlag);
  // }, [membersInfo]);





  const sendMessage = () => {
    if (!isEmptyOrSpaces(toSend)) {
      setSendMessage("");
      let sendObj = {
        SessionToken: props.connectionReducer.connection.current.sessionToken,
        ChatId: chatId,
        Body: toSend,
      };
      props.sendDataToServer(4, true, sendObj, (response) => {
        console.log(response);
        // setAllMessages([response, ...allMessages])
        // setRerenderFlag(!reRenderFlag)
      });
    }
  };

  // useEffect(() => {
  //   setRerenderFlag(!reRenderFlag);
  // }, [allMessages]);

  // const handleBackPress = () =>{
  //   BackHandler.removeEventListener('hardwareBackPress', handleBackPress);

  //   props.unsubscribeFromUpdate('chatscreen', (removed) => {
  //     console.log('Subscription removed:');
  //     console.log(removed);
  //   });

  //   props.navigation.navigate('Chats', {
  //     backFromChat: chatId,
  //   });
  //   return true
  // }

  // useEffect(() =>{
  //   BackHandler.addEventListener('hardwareBackPress', handleBackPress);
  // }, [])

  const isEmptyOrSpaces = (str) => {
    return str === null || str.match(/^ *$/) !== null;
  };

  //getting chat data
  useEffect(() => {
    let getChatPromise = new Promise((resolve, reject) => {
      props.loadDocFromDB(chatId, (docs) => {
        console.log(docs);
        let chat = docs[0];
        resolve(chat);
      });
    });
    getChatPromise.then((chat) => {
      setAllMessages(chat.Messages);
      setGroupFlag(chat.IsGroup);
      getAllMembers(chat.Members);
    });
  }, [props.chatId]);

  useEffect(() => {
    props.subscribeToUpdate(5, "chatscreen", (data) => {
      if (data.ChatId == chatId) {
        let newMessages = data.NewMessages;
        setAllMessages([...newMessages, ...allMessages]);
        setRerenderFlag(!reRenderFlag);
      }
    });
  }, [allMessages]);

  // useEffect(() => {
  //   console.log("All messages changed!!!!!!!!!!!")
  //   console.log(allMessages)
  // }, [allMessages])

  // action when leave screen
  // useEffect(() => {
  //   const unsubscribe = props.navigation.addListener('beforeRemove', () => {

  //   });

  //   return unsubscribe;
  // }, [props.navigation]);

  const decapsulateDateFromId = (id) => {
    let decapsulatedDate = parseInt(id.substring(0, 8), 16) * 1000;
    let date = new Date(decapsulatedDate);
    return date.toTimeString().split(' ')[0].substr(0, 5);
  };

  const renderItem = (x) => {
    let memberInfoIndex = membersInfo.findIndex((y) => y.UserID == x.Sender);
    let memberInfo;
    if (memberInfoIndex != -1) {
      memberInfo = membersInfo[memberInfoIndex];
    }
    return(<MessageBox
              body={x.Body}
              isMine={
                props.connectionReducer.connection.current.myId == x.Sender
              }
              isSystem={x.Sender == 'System'}
              isGroup={isGroup}
              memberName={
                memberInfo == null
                  ? ''
                  : memberInfo.FirstName + ' ' + memberInfo.LastName
              }
              timestamp={decapsulateDateFromId(x._id)}
            ></MessageBox>)
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

  return (
    <div>
      <div className="chatHeader">
        <div className="chatBar"></div>
      </div>
      <div className="messageThread">
        {allMessages.map((x) => {
          return (
            renderItem(x)
          );
        })}
      </div>
    </div>
    // <View style={styles.mainContainer}>
    //   <View style={styles.chatHeader}>
    //     <Image style={styles.chatImage}></Image>
    //     <Text style={styles.chatName}>{props.route.params.chatName}</Text>
    //   </View>
    //   <View style={styles.messagesWindow}>
    //     <FlatList style={styles.messageThread}
    //     inverted
    //     data={allMessages}
    //     renderItem={renderItem}
    //     ItemSeparatorComponent = { ChatThreadSeparator }
    //     keyExtractor={(item) => item._id}
    //     extraData={reRenderFlag}
    //     onEndReached={chatEndRiched}>
    //     </FlatList>
    //   </View>
    //   <View style={styles.sendMessageBox}>
    //     <TextInput
    //       style={styles.inputStyle}
    //       value={toSend}
    //       onChangeText={(text) => setSendMessage(text)}
    //       placeholder="Message"></TextInput>
    //     <TouchableOpacity style={styles.sendButton} onPress={() =>{sendMessage()}}>
    //       <FontAwesomeIcon
    //         icon={faPaperPlane}
    //         size={28}
    //         style={styles.sendIcon}
    //       />
    //     </TouchableOpacity>
    //   </View>
    // </View>
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
