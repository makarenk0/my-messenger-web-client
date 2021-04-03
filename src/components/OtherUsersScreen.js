import {View, Text, StyleSheet, ScrollView, TextInput} from 'react-native';
import {SearchBar} from 'react-native-elements';
import React, {useState, useEffect} from 'react';
import {FlatList} from 'react-native';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
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
import { SEARCH_USERS_WAIT_TIMEOUT } from '../configs';
import UserRepresenter from './UserRepresenter';

const OtherUsersScreen = (props) => {
  const [searchField, setSearchField] = useState('');
  const [resultUsers, setResultUsers] = useState([]);
  const [userInputTimer, setUserInputTimer] = useState("");
  const [loading, setLoading] = useState(false);

  const isEmptyOrSpaces = (str) => {
    return str === null || str.match(/^ *$/) !== null;
  };

  useEffect(() => {
    if(userInputTimer !== ""){
      clearTimeout(userInputTimer)
    }
    setLoading(true)
    setUserInputTimer(setTimeout(requestToServer, SEARCH_USERS_WAIT_TIMEOUT))
  }, [searchField]);

  const requestToServer = () => {
    setLoading(false)
    if (!isEmptyOrSpaces(searchField)) {
      let finUsersObj = {
        SessionToken: props.connectionReducer.connection.current.sessionToken,
        FindUsersRequest: searchField,
      };

      props.sendDataToServer(3, true, finUsersObj, (response) => {
        if(response.Status == "success"){
          console.log(response.Users)
          setResultUsers(response.Users)
        }
        else{
          console.log(response.Status)
          console.log(response.Details)
        }
      });
    }
  };

  const renderItem = ({ item }) => {
    return(
      <UserRepresenter userFirstName={item.FirstName} userLastName={item.LastName} userLogin={item.Login}></UserRepresenter>
    )
  }

  return (
    <View>
      <SearchBar
        style={styles.searchField}
        placeholder="Enter user login or name"
        onChangeText={setSearchField}
        value={searchField}
        showLoading={loading}
        loadingProps={{
          animating: true,
          color: 'black',
        }}></SearchBar>
      <FlatList style={styles.usersThread}
        data={resultUsers}
        renderItem={renderItem}
        keyExtractor={(item) => item.UserID}>
        </FlatList>
      
    </View>
  );
};

const styles = StyleSheet.create({
  searchField: {
    alignSelf: 'center',
    width: '90%',
  },
});

const mapStateToProps = (state) => {
  const {connectionReducer, localDBReducer} = state;
  return {
    connectionReducer,
    localDBReducer,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
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

const ConnectedOtherUsersScreen = connect(
  mapStateToProps,
  mapDispatchToProps,
)(OtherUsersScreen);

export default ConnectedOtherUsersScreen;
