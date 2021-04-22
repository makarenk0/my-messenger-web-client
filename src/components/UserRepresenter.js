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

const UserRepresenter = (props) => {
  const userPressed = () => {
    //props.onPress(props.chatId, props.chatName);
  };

  return (
    <View style={styles.mainContainer}>
      <TouchableHighlight
        style={styles.touchZone}
        onPress={userPressed}
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
          <View>
            <Text style={styles.userName}>{props.userFirstName} {props.userLastName}</Text>
            <Text style={styles.userLogin}>@{props.userLogin}</Text>
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
  userName: {
    fontWeight: 'bold',
    marginLeft: 20,
    marginTop: 5,
    fontSize: 18,
  },
  userLogin: {
    marginTop: 5,
    marginLeft: 20,
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

export default UserRepresenter;



