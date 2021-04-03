import React, {useState, useEffect} from 'react';
import {
  DrawerItemList,
  DrawerContentScrollView,
} from '@react-navigation/drawer';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faSignOutAlt} from '@fortawesome/free-solid-svg-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {removeDocFromDB, updateValue} from '../actions/LocalDBActions';

import {
  StyleSheet,
  ScrollView,
  TextInput,
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  Button,
} from 'react-native';

const DrawerContent = (props) => {
  const logOut = async () => {
    //remove all user data (saved chats, other data)
    props.removeDocFromDB({}, true, (err, numberOfRemoved) =>{
        console.log("All user data removed")
        console.log(numberOfRemoved)
    })
    await AsyncStorage.setItem('loginData', JSON.stringify({remember: false})); //disabling auto log in
    props.navigation.navigate('Log In');
  };
  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
      <TouchableOpacity style={styles.logOutButton} onPress={logOut}>
        <Text
          style={{
            textAlignVertical: 'center',
            height: '100%',
            marginLeft: 20,
            textAlign: 'center',
            fontSize: 20,
          }}>
          Log out
        </Text>
        <FontAwesomeIcon
          icon={faSignOutAlt}
          size={25}
          style={styles.logOutIcon}
        />
      </TouchableOpacity>
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  logOutButton: {
    width: 150,
    height: 40,
    backgroundColor: '#8ED1FC',
    marginLeft: 10,
    flexDirection: 'row',
  },
  logOutIcon: {
    position: 'absolute',
    right: 5,
    top: 10,
  },
});

const mapStateToProps = (state) => {
  const {localDBReducer} = state;
  return {
    localDBReducer,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      removeDocFromDB,
      updateValue,
    },
    dispatch,
  );

const ConnectedDrawerContent = connect(
  mapStateToProps,
  mapDispatchToProps,
)(DrawerContent);

export default ConnectedDrawerContent;
