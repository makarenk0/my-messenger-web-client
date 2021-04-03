import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  Image,
  StyleSheet,
  ScrollView,
  TextInput,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {showModal, hideModal} from '../actions/ModalActions';
import {
  connectToServer,
  sendDataToServer,
  subscribeToUpdate,
} from '../actions/ConnectionActions';
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
} from '../actions/LocalDBActions';

import ChatRepresenter from './ChatRepresenter';

const HomeScreen = (props) => {
  const [allChats, setAllChats] = useState([]);

  //after leaving chat screen clear new messages counter
  useEffect(() => {
    if(props.route.params?.backFromChat){
      let backFromChatIndex = allChats.findIndex(x => x.chatId == props.route.params.backFromChat)
      console.log(backFromChatIndex)
      let updated = allChats
      updated[backFromChatIndex].newMessagesNum = 0
      setAllChats(updated)

      props.updateValue(
        {_id: props.route.params.backFromChat},
        {NewMessagesNum: 0},
      );

      props.navigation.setParams({backFromChat: null})
    }
  }, [props.route.params?.backFromChat])



  const addNewChatToDB = (chat) => {
    let newMessages = chat.NewMessages;
    props.saveDocToDB(
      {
        _id: chat.ChatId,
        ChatName: chat.ChatName,
        Members: chat.Members,
        Messages: chat.NewMessages,
        NewMessagesNum: newMessages.length,
        LastMessageId: newMessages[newMessages.length - 1]._id,
      },
      (err, newDoc) => {
        console.log('New chat in DB');
        //updating array with existing chats ids
        props.addOneToArray(
          {Type: 'localChatsIds'},
          {ChatIds: chat.ChatId},
          (err, docs) => {
            console.log(err);
            console.log(docs);
          },
        );
      },
    );
  };

  const updateExistingChatInDB = (chat) => {
    let newMessages = chat.NewMessages;
    //adding all new messages to messages array
    console.log('adding all new messages to messages array');
    props.addManyToArray({_id: chat.ChatId}, 'Messages', newMessages);
    props.getProjected({_id: chat.ChatId}, {NewMessagesNum: 1}, (promise) => {
      promise.then((el) => {
        //updating "LastMessageId" field
        props.updateValue(
          {_id: chat.ChatId},
          {NewMessagesNum: el[0].NewMessagesNum + newMessages.length, LastMessageId: newMessages[newMessages.length - 1]._id},
        );
      });
    });
  };

  const updateAllChatsToDisplay = (local, updated) => {
    // updating "allChats" array which is used to display chats
    // increasing new messages counter
    local = local.map((x) => {
      let update = updated.find((y) => y.chatId == x.chatId);
      if (typeof update !== 'undefined') {
        //update counter only in case there is an update
        x.newMessagesNum += update.newMessagesNum;
      }
      return x;
    });

    //adding new chats
    let newChats = updated.filter((x) => x.isNew);
    local.unshift(...newChats);

    //applying changes
    console.log('Changing all chats data to display');
    setAllChats(local);
  };

  useEffect(() => {
    props.subscribeToUpdate(5, 'homescreen', (data) => {
      console.log(data);
      console.log(data.IsNew);
      if (data.IsNew) {
        console.log('Adding new chat in real-time');
        addNewChatToDB(data);
      } else {
        console.log('Updating existing chat in real-time');
        updateExistingChatInDB(data);
      }
      let ChatRepresentorsUpdatedData = [];
      ChatRepresentorsUpdatedData.push({
        chatId: data.ChatId,
        chatName: data.ChatName,
        chatMembers: data.Members,
        isNew: data.IsNew,
        newMessagesNum: data.NewMessages.length,
      });
      updateAllChatsToDisplay(allChats, ChatRepresentorsUpdatedData);
    });
  }, [allChats]);

  const zeroPacketRequest = (LastChatsMessages, ChatRepresentorsLocalData) => {
    let ChatRepresentorsUpdatedData = []; // this array will be a response data for "LastChatsMessages" array

    let regObj = {
      SessionToken: props.connectionReducer.connection.current.sessionToken,
      SubscriptionPacketNumber: '5', //packet number which server will use for real-time update
      LastChatsMessages: LastChatsMessages,
    };

    //after "LastChatsMessages" array formed - send it to server and subscribe for real-time update on packet number 5
    props.sendDataToServer(7, true, regObj, (response) => {
      if (response.Status == 'error') {
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
            newMessagesNum: element.NewMessages.length,
          });
          // -----------------------
        });
      }

      updateAllChatsToDisplay(
        ChatRepresentorsLocalData,
        ChatRepresentorsUpdatedData,
      );
    });
  };

  useEffect(() => {
    props.loadDB('localDB');

    //show all
    // props.loadDocFromDB({}, (err, docs) => {
    //   console.log('');
    //   console.log('All docs:');
    //   console.log(docs);
    //   console.log('');
    // });

    //remove all
    // props.removeDocFromDB({}, true, (err, numberOfRemoved) =>{
    //    console.log(numberOfRemoved)
    // })

    // props.saveDocToDB({Type: 'localChatsIds', ChatIds: ["6052553af34ec222c2c36a57"]}, (err, newDoc) =>{
    //   console.log(newDoc)
    // })

    // props.saveDocToDB({_id: '6052553af34ec222c2c36a57', ChatName: "some_name", Members: ["604e35066b4e72e77404925b", "6052036cb9277234a5b10187"], Messages:
    // [{_id: '60526d82fd5b47331d0f0401', Sender: '604e35066b4e72e77404925b', Body: "Second message add to db"}], LastMessageId: "60526d82fd5b47331d0f0401"}, (err, newDoc) =>{
    //   console.log(newDoc)
    // })

    // props.removeDocFromDB({_id: '6052553af34ec222c2c36a57'}, true, (err, numberOfRemoved) =>{
    //   console.log(numberOfRemoved)
    // })

    //   props.addToArray({Type: 'localChatsIds'}, {ChatIds: "605210b6ca1a7d4c922dd7c5"}, (err, docs) =>{
    //     console.log(docs)
    // })

    // props.removeFromArray({type: 'localChatsIds'}, {chatIds: "605210b6ca1a7d4c922dd7c5"}, (err, docs) =>{
    //       console.log(docs)
    //   })

    // props.loadDocFromDB({_id: '6052553af34ec222c2c36a57'}, (err, docs) =>{
    //   console.log(docs[0])
    // })

    props.loadDocFromDB({Type: 'localChatsIds'}, (err, docs) => {
      if (docs.length == 0) {
        props.saveDocToDB(
          {Type: 'localChatsIds', ChatIds: []},
          (err, newDoc) => {
            console.log('Local chats initialized');
            zeroPacketRequest([], []);
          },
        );
      } else {
        if (docs[0].ChatIds.length == 0) {
          zeroPacketRequest([], []);
        } else {
          let LastChatsMessages = []; //this array will be send to server and server will determine which new messages do you need (or new chats)
          var ChatRepresentorsLocalData = []; // this array is formed with data of chats which are stored locally

          let allPreojectionPromises = []; // as access to local db is async, each request for chat return promise, so to get all chats and then do something we should wait for all promises
          docs[0].ChatIds.forEach((chatId) => {
            console.log(chatId);

            //we need only projections (Only "LastMessageId" field, "ChatName" field and "Members" field )
            props.getProjected(
              {_id: chatId},
              {LastMessageId: 1, ChatName: 1, Members: 1, NewMessagesNum: 1},
              (promise) => {
                promise.then((lastMessageId) => {
                  //pushing data from db to array
                  ChatRepresentorsLocalData.push({
                    chatId: chatId,
                    chatName: lastMessageId[0].ChatName,
                    chatMembers: lastMessageId[0].Members,
                    newMessagesNum: lastMessageId[0].NewMessagesNum, //TO DO: create a field of number of new messages in db
                  });
                  //pushing "ChatId" and "LastMessageId" to array which will be send to server
                  LastChatsMessages.push({
                    ChatId: chatId,
                    LastMessageId: lastMessageId[0].LastMessageId,
                  });
                });
                allPreojectionPromises.push(promise); //pushing all promises to array
              },
            );
            //--------------------------------------------------------------------------------------------
          });
          // waiting for all requests are completed on database
          Promise.all(allPreojectionPromises).then((res) => {
            zeroPacketRequest(LastChatsMessages, ChatRepresentorsLocalData);
          });
        }
      }
    });
  }, []);


  // useEffect(() => {
  //   // const unsubscribe = props.navigation.addListener('focus', () => {
  //   //   console.log("Focused on home screen")
  //   //   //console.log(chatId)
  //   // });
  //   // return unsubscribe;
  // }, []);


  // in case of chat is pressed (navigating to "ChatScreen" and passing chatId )
  const chatPressed = (chatId, chatName) => {
    props.navigation.navigate('ChatScreen', {
      chatId: chatId,
      chatName: chatName,
    });    
  };



  return (
    <View>
      <ScrollView>
        {allChats.map((x) => (
          <ChatRepresenter
            key={x.chatId}
            chatId={x.chatId}
            chatName={x.chatName}
            newMessagesNum={x.newMessagesNum}
            onPress={chatPressed}></ChatRepresenter>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({});

const mapStateToProps = (state) => {
  const {connectionReducer, ModalReducer, localDBReducer} = state;
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
    dispatch,
  );

const ConnectedHomeScreen = connect(
  mapStateToProps,
  mapDispatchToProps,
)(HomeScreen);

export default ConnectedHomeScreen;
