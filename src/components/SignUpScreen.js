import React, {useState, useEffect, useRef} from 'react';

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {showModal, hideModal} from '../actions/ModalActions';
import {
  connectToServer,
  sendDataToServer,
} from '../actions/ConnectionActions';

const SignUpScreen = (props) => {
  const [loginValue, setLoginValue] = useState('');
  const [passwordValue, setPasswordValue] = useState('');
  const [firstNameValue, setfirstNameValue] = useState('');
  const [lastNameValue, setlastNameValue] = useState('');
  const [date, setDate] = useState(new Date());
  const [errorText, setErrorText] = useState('');
  const [successText, setSuccessText] = useState('');
  const [loading, setLoading] = useState(false)

  var passwordReg = new RegExp(
    '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})',
  );
  const signUpButtonPressed = () => {
    console.log("Async button start")
    setErrorText('')
    setSuccessText('')
    if (!passwordReg.test(passwordValue)) {
      setErrorText(
        'Password must contain:\nat least 1 lowercase character,\nat least 1 uppercase character,\nat least 1 numeric character,\nat least one special character,\nmust be eight characters or longer',
      );
      return;
    }
    let regObj = {
      Login: loginValue,
      FirstName: firstNameValue,
      LastName: lastNameValue,
      BirthDate: date.toString(),
      Password: passwordValue,
    };
    setLoading(true)

    props.sendDataToServer(1, true, regObj, (response) => {
        if (response.Status == 'error') {
          setErrorText(response.Details);
        }
        else{
          setSuccessText(response.Details);
        }
        console.log("Fetch end")
        setLoading(false)
      });
    
    console.log("Async button end")
  };


  //TO DO: adapt screen
  return (
    <div></div>
    // <View style={styles.mainContainer}>
    //   <ScrollView style={styles.scrollView}>
    //     <View style={styles.elementContainer}>
    //       <TextInput
    //         style={styles.inputStyle}
    //         value={loginValue}
    //         onChangeText={(text) => {
    //           setLoginValue(text);
    //           setErrorText('');
    //         }}
    //         placeholder="Login"></TextInput>
    //       <TextInput
    //         style={styles.inputStyle}
    //         value={passwordValue}
    //         onChangeText={(text) => {
    //           setPasswordValue(text);
    //           setErrorText('');
    //         }}
    //         placeholder="Password"></TextInput>
    //       <TextInput
    //         style={styles.inputStyle}
    //         value={firstNameValue}
    //         onChangeText={(text) => {
    //           setfirstNameValue(text);
    //         }}
    //         placeholder="First name"></TextInput>
    //       <TextInput
    //         style={styles.inputStyle}
    //         value={lastNameValue}
    //         onChangeText={(text) => {
    //           setlastNameValue(text);
    //         }}
    //         placeholder="Last name"></TextInput>
    //       <Text style={styles.birthDateText}>Birth date</Text>
    //       <DatePicker
    //         style={styles.birthDatePicker}
    //         date={date}
    //         mode="date"
    //         locale="en-GB"
    //         androidVariant="nativeAndroid"
    //         onDateChange={setDate}
    //       />
          
    //       <Text style={styles.inputErrorText}>{errorText}</Text>
    //       <Text style={styles.inputSuccessText}>{successText}</Text>

    //       <ActivityIndicator animating={loading} size="large" color="#67daf9"/>
    //       <TouchableOpacity
    //         style={styles.signUpButton}
    //         onPress={signUpButtonPressed}>
    //         <Text style={{fontSize: 20}}>Sign up</Text>
    //       </TouchableOpacity>
    //     </View>
    //   </ScrollView>
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
    },
    dispatch,
  );

const ConnectedSignUpScreen = connect(
  mapStateToProps,
  mapDispatchToProps,
)(SignUpScreen);

export default ConnectedSignUpScreen;
