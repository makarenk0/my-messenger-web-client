import React, { useState, useEffect, useRef } from "react";
import { useHistory } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { showModal, hideModal } from "../actions/ModalActions";
import { Form, Button, Alert } from "react-bootstrap";
import {
  connectToServer,
  sendDataToServer,
} from "../actions/ConnectionActions";

import DatePicker from 'react-datepicker'


const SignUpScreen = (props) => {
  const [loginValue, setLoginValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");
  const [firstNameValue, setfirstNameValue] = useState("");
  const [lastNameValue, setlastNameValue] = useState("");
  const [date, setDate] = useState(new Date());
  const [errorText, setErrorText] = useState("");
  const [successText, setSuccessText] = useState("");
  const [showAlertErr, setShowAlertErr] = useState(false);
  const [showAlertSuccess, setShowAlertSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  let history = useHistory();

  var passwordReg = new RegExp(
    "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})"
  );
  const signUpButtonPressed = () => {
    setShowAlertErr(false)
    setShowAlertSuccess(false)
    setErrorText("");
    setSuccessText("");

    if (!passwordReg.test(passwordValue)) {
      setErrorText(
        "Password must contain:\nat least 1 lowercase character,\nat least 1 uppercase character,\nat least 1 numeric character,\nat least one special character,\nmust be eight characters or longer"
      );
      setShowAlertErr(true)
      return;
    }
    if(!/\S/.test(loginValue)){
      console.log(loginValue)
      setErrorText(
        "Please enter login"
      );
      setShowAlertErr(true)
      return;
    }
    if(!/\S/.test(firstNameValue)){
      setErrorText(
        "Please enter first name"
      );
      setShowAlertErr(true)
      return;
    }
    if(!/\S/.test(lastNameValue)){
      setErrorText(
        "Please enter last name"
      );
      setShowAlertErr(true)
      return;
    }

    let regObj = {
      Login: loginValue,
      FirstName: firstNameValue,
      LastName: lastNameValue,
      BirthDate: date.toString(),
      Password: passwordValue,
    };
    setLoading(true);

    props.sendDataToServer('1', true, regObj, (response) => {
      if (response.Status == "error") {
        setErrorText(response.Details);
        setShowAlertErr(true)
      } else {
        setSuccessText(response.Details);
        setShowAlertSuccess(true)
      }
      console.log("Fetch end");
      setLoading(false);
    });
  };

  //TO DO: adapt screen
  return (
    <div className="signUp">
      <Alert key={"signUpAlertErr"} className="signUpError" show={showAlertErr} variant={"danger"} onClose={() => {setShowAlertErr(false)}} dismissible>{errorText}</Alert>
      <Alert key={"signUpAlertSuccess"} className="signUpError" show={showAlertSuccess} variant={"success"} onClose={() => {setShowAlertSuccess(false)}} dismissible>{successText}</Alert>
      <Form className="signUpForm">
      
        <Form.Group controlId="formBasicEmail">
          <Form.Label>Login</Form.Label>
          <Form.Control placeholder="Enter login" onChange={e => setLoginValue(e.target.value)}/>
        </Form.Group>

        <Form.Group>
          <Form.Label>First name</Form.Label>
          <Form.Control type="text" placeholder="Enter first name" onChange={e => setfirstNameValue(e.target.value)}/>
        </Form.Group>

        <Form.Group>
          <Form.Label>Last name</Form.Label>
          <Form.Control type="text" placeholder="Enter last name" onChange={e => setlastNameValue(e.target.value)} />
        </Form.Group>

        <Form.Group controlId="formBasicPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control type="password" placeholder="Password" onChange={e => setPasswordValue(e.target.value)}/>
        </Form.Group>

        <Form.Group>
          <Form.Label>Birth date</Form.Label><br/>
          <DatePicker wrapperClassName="datePicker" selected={date} onChange={date => setDate(date)} />
        </Form.Group>

        <Button block size="lg" type="button" variant="info" onClick={signUpButtonPressed}>
          Sign up
        </Button>
        <Button block size="lg" type="button" variant="primary" onClick={() => { history.goBack();}}>
          Go back to log in
        </Button>
      </Form>
    </div>
  );
};

const mapStateToProps = (state) => {
  const { connectionReducer, ModalReducer } = state;
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
    dispatch
  );

const ConnectedSignUpScreen = connect(
  mapStateToProps,
  mapDispatchToProps
)(SignUpScreen);

export default ConnectedSignUpScreen;
