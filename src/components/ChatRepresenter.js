import React, {useState, useEffect} from 'react';
import {Avatar} from 'react-native-elements';
import {
  SafeAreaView,
  Image,
  StyleSheet,
  ScrollView,
  TextInput,
  View,
  Text,
  TouchableOpacity,
  TouchableHighlight,
} from 'react-native';
import {greaterThan} from 'react-native-reanimated';

const ChatRepresenter = (props) => {
  const chatPressed = () => {
    props.onPress(props.chatId, props.chatName);
  };

  return (
    <View style={styles.mainContainer}>
      <TouchableHighlight
        style={styles.touchZone}
        onPress={chatPressed}
        underlayColor="#67daf9">
        <View style={styles.innerBox}>
          {/* <Image style={styles.chatImage}></Image> */}
          <Avatar
            rounded
            size={60}
            icon={{name: 'user', type: 'font-awesome'}}
            containerStyle={{
              backgroundColor: '#ccc',
              marginTop: 10,
              marginBottom: 10,
              marginLeft: 10,
            }}
            activeOpacity={0.7}
          />
          <Text style={styles.chatName}>{props.chatName}</Text>
          <View style={styles.newMessagesCounterBox}>
            {props.newMessagesNum == 0 ? null : (
              <Text style={styles.newMessagesCounterText}>
                {props.newMessagesNum}
              </Text>
            )}
          </View>
        </View>
      </TouchableHighlight>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    width: '100%',
    height: 80,
    borderColor: '#a9a9a9',
    borderWidth: 1,
  },
  touchZone: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
  },
  chatName: {
    fontWeight: 'bold',
    marginLeft: 20,
    marginTop: 5,
    fontSize: 18,
  },
  innerBox: {
    flexDirection: 'row',
  },
  chatImage: {
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 10,
  },
  newMessagesCounterBox: {
    height: 22,
    borderRadius: 10,
    backgroundColor: '#67daf9',
    position: 'absolute',
    right: 20,
    top: 25,
  },
  newMessagesCounterText: {
    paddingLeft: 5,
    paddingRight: 5,
  },
});

export default ChatRepresenter;
