import React, {useState, useEffect} from 'react';

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {showModal, hideModal} from '../actions/ModalActions';
import {
  connectToServer,
  sendDataToServer,
  subscribeToUpdate,
  unsubscribeFromUpdate,
} from '../actions/ConnectionActions';

import {
  loadDocFromDB,
  removeDocFromDB,
  addOneToArray,
  addManyToArray,
  removeFromArray,
  getProjected,
  updateValue,
} from '../actions/LocalDBActions';
//import MessageBox from './MessageBox';

const ChatScreen = (props) => {
  const chatId = props.chatId;
  const [toSend, setSendMessage] = useState('');
  const [allMessages, setAllMessages] = useState([]);
  const [reRenderFlag, setRerenderFlag] = useState(true);

  const sendMessage = () => { 
    if(!isEmptyOrSpaces(toSend)){
      setSendMessage('');
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

  useEffect(() => {
    setRerenderFlag(!reRenderFlag)
  }, [allMessages])

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
  

  const isEmptyOrSpaces = (str) =>{
    return str === null || str.match(/^ *$/) !== null;
  }

  //getting chat data
  useEffect(() => {
    console.log(chatId)
    let getChatPromise = new Promise((resolve, reject) => {
      props.loadDocFromDB(chatId, (docs) =>{
        console.log(docs)
          let chat = docs[0]
          resolve(chat.Messages.reverse())
      })
    })
    getChatPromise.then((messages) =>{
      setAllMessages(messages)
    })
    
  }, []);

  useEffect(() => {
    props.subscribeToUpdate(5, 'chatscreen', (data) => {
      if (data.ChatId == chatId) {
        let newMessages = data.NewMessages
        setAllMessages([...newMessages, ...allMessages])
        setRerenderFlag(!reRenderFlag)
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

  const decapsulateDateFromId = (id) =>{
    let decapsulatedDate = parseInt(id.substring(0, 8), 16) * 1000
    let date = new Date(decapsulatedDate)
    return date
  }

  const renderItem = ({ item }) => {
    return(
      <p>{item.Body}</p>
      //<MessageBox body={item.Body} isMine={props.connectionReducer.connection.current.myId == item.Sender} timestamp={decapsulateDateFromId(item._id)}></MessageBox>
    )
  }

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

  const chatEndRiched = () =>{
    console.log("end reached")
  }

  return (
    <div>
      {allMessages.map(x => {
        return(<p key={x._id}>{x.Body}</p>)
      })}
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
  const {connectionReducer, ModalReducer} = state;
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
      removeDocFromDB,
      addOneToArray,
      addManyToArray,
      removeFromArray,
      getProjected,
      updateValue,
    },
    dispatch,
  );

const ConnectedChatScreen = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ChatScreen);

export default ConnectedChatScreen;
