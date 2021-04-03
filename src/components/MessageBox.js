import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

const MessageBox = (props) => {
  return (
    <View style={{alignItems: props.isMine ? 'flex-end' : 'flex-start'}}>
      <View
        style={{
          backgroundColor: props.isMine ? '#00BCD4' : '#03a9f4',
          padding: 10,
          borderRadius: 5,
          marginTop: 10,
          marginRight: props.isMine ? 15 : 0,
          marginLeft: props.isMine ? 0 : 15,
        }}>
        <Text style={styles.body}>{props.body}</Text>
        <Text style={styles.timestamp}>{props.timestamp.getHours()+":"+props.timestamp.getMinutes()}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: 'green',
  },
  body: {
    maxWidth: "80%",
  },
  timestamp: {
      fontSize: 11,
  }
});

export default MessageBox;
