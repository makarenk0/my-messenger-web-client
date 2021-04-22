import * as React from 'react';
import {
  ActivityIndicator,
  Text,
  View,
  StyleSheet,
  Modal,
  Easing,
} from 'react-native';

const Error = (props) => {
  return (
    <View style={styles.mainView}>
      <Text style={styles.loaderText}>{props.displayText}</Text>
    </View>
  );
};


const styles = StyleSheet.create({
  mainView: {
    height: 40,
    flexDirection: 'row',
    backgroundColor: '#a52a2a',
  },
  loaderText: {
    marginLeft: 20,
    fontSize: 20,
    textAlignVertical: 'center',
  }
});

export default Error;