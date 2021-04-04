import React, {useState, useEffect} from 'react';

const ChatRepresenter = (props) => {
  const chatPressed = () => {
    props.onPress(props.chatId, props.chatName);
  };

  return (
    <div className="chatRepresentorContainer">
      <p>{props.chatName}</p>
      <p>{props.newMessagesNum}</p>
    </div>
    // <View style={styles.mainContainer}>
    //   <TouchableHighlight
    //     style={styles.touchZone}
    //     onPress={chatPressed}
    //     underlayColor="#67daf9">
    //     <View style={styles.innerBox}>
    //       {/* <Image style={styles.chatImage}></Image> */}
    //       <Avatar
    //         rounded
    //         size={60}
    //         icon={{name: 'user', type: 'font-awesome'}}
    //         containerStyle={{
    //           backgroundColor: '#ccc',
    //           marginTop: 10,
    //           marginBottom: 10,
    //           marginLeft: 10,
    //         }}
    //         activeOpacity={0.7}
    //       />
    //       <Text style={styles.chatName}>{props.chatName}</Text>
    //       <View style={styles.newMessagesCounterBox}>
    //         {props.newMessagesNum == 0 ? null : (
    //           <Text style={styles.newMessagesCounterText}>
    //             {props.newMessagesNum}
    //           </Text>
    //         )}
    //       </View>
    //     </View>
    //   </TouchableHighlight>
    // </View>
  );
};

export default ChatRepresenter;
