import * as React from 'react';
import {
  ActivityIndicator,
  Text,
  View,
  StyleSheet,
  Modal,
  Easing,
} from 'react-native';

const Loading = (props) => {
  return (
    <View style={styles.mainView}>
      <ActivityIndicator size="large" color="#fff" style={styles.loaderStyle} />
      <Text style={styles.loaderText}>{props.displayText}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  mainView: {
    height: 40,
    flexDirection: 'row',
    backgroundColor: '#67daf9',
  },
  loaderStyle: {
    marginLeft: 20
  },
  loaderText: {
    marginLeft: 20,
    fontSize: 20,
    textAlignVertical: 'center',
  }
});

export default Loading;
