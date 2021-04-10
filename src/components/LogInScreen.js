import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { showModal, hideModal } from "../actions/ModalActions";
import { Form, Button, Alert } from "react-bootstrap";
import logo from '../images/logoLoader.png'
import logoCenter from '../images/message64.png'
import {
  connectToServer,
  sendDataToServer,
  setSessionTokenAndId,
} from "../actions/ConnectionActions";
import { LOCAL_SERVER_IP, CONNECTING_TIMEOUT_MILLIS } from "../configs";

const LogInScreen = (props) => {
  const [errorText, setErrorText] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberIsSelected, setRemember] = useState(false);
  const [loginValue, setLoginValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");
  const [show, setShow] = useState(false);

  let history = useHistory();

  const autoLogin = () => {
    const getLoginData = async () => {
      try {
        const jsonValue = await localStorage.getItem("loginData");
        return jsonValue != null ? JSON.parse(jsonValue) : null;
      } catch (e) {
        console.log(e);
      }
    };
    getLoginData().then((data) => {
      if (data != null && data.remember) {
        logIntoAccount(data.login, data.password, data.remember);
      }
    });
  };

  const logIntoAccount = (login, password, rememberUser) => {
    setErrorText("");
    setShow(false)
    let regObj = {
      Login: login,
      Password: password,
    };
    setLoading(true);

    props.sendDataToServer(2, true, regObj, async (response) => {
      if (response.Status === "error") {
        setErrorText(response.Details);
        setShow(true)
      } else {
        console.log(response);
        props.setSessionTokenAndId(response.SessionToken, response.Id);
        let saveLogPassObj;
        if (rememberUser) {
          saveLogPassObj = {
            remember: true,
            login: login,
            password: password,
          };
        } else {
          saveLogPassObj = {
            remember: false,
          };
        }

        try {
          const jsonValue = JSON.stringify(saveLogPassObj);
          await localStorage.setItem("loginData", jsonValue);
        } catch (e) {
          console.log(e);
        }

        history.push("/home");
      }
      //console.log(props.connectionReducer.connection.current.sessionToken)
    });
  };

  useEffect(() => {
    async function connect() {
      let connected = false;
      const checkConnection = () => {
        props.hideModal();
        if (!connected) {
          props.showModal("Error", {
            displayText: "Failed to connect to server...",
          });
          console.log("Not connected!!!!");
        }
      };
      await props.connectToServer(
        LOCAL_SERVER_IP,
        (address) => {
          console.log("Connected!!!!");
          connected = true;

          autoLogin();
        },
        () => {
          props.showModal("Error", {
            displayText: "Server closed connection",
          });
          console.log("Server closed connection");
        }
      );
      props.showModal("Loading", { displayText: "Connecting to server..." });
      setTimeout(checkConnection, CONNECTING_TIMEOUT_MILLIS);
    }
    connect();
  }, []);

  const signInButtonPressed = (e) => {
    
    logIntoAccount(loginValue, passwordValue, rememberIsSelected);
  };

  const signUpButtonPressed = () => {
    //props.showModal('Success', {displayText: 'Connecting to server...'});
    history.push("/signUp");
  };

  

  return (
    <div className="login">
      <img src={logo} style={{animation: `spin 3s linear infinite`}} className="loginLogo"> 
      </img>
      <img src={logoCenter} className="loginCenter"></img>
      <Form className="loginForm">
      <Alert key={"logInAlert"} className="logInError" show={show} variant={"danger"} onClose={() => setShow(false)} dismissible>{errorText}</Alert>
        <Form.Group size="lg" controlId="text">
          <Form.Label>Login</Form.Label>
          <Form.Control
            autoFocus
            type="text"
            onChange={e => setLoginValue(e.target.value)} value={loginValue}
          />
        </Form.Group>
        <Form.Group size="lg" controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            onChange={e => setPasswordValue(e.target.value)} value={passwordValue}
          />
        </Form.Group>
        <Button block size="lg" type="button" onClick={signInButtonPressed}>
          Log in
        </Button>
        <Button block size="lg" type="button" variant="outline-info" onClick={signUpButtonPressed}>
          Sign up
        </Button>
      </Form>
    </div>
    // <Form className="loginForm">
    //   <Form.Group controlId="formBasicEmail">
    //     <Form.Label>Login</Form.Label>
    //     <Form.Control type="text" placeholder="Enter email" onChange={e => setLoginValue(e.target.value)} value={loginValue} />
    //   </Form.Group>

    //   <Form.Group controlId="formBasicPassword">
    //     <Form.Label>Password</Form.Label>
    //     <Form.Control type="password" placeholder="Password" onChange={e => setPasswordValue(e.target.value)} value={passwordValue} />
    //   </Form.Group>
    //   <Form.Group controlId="formBasicCheckbox">
    //     <Form.Check type="checkbox" label="Remember me" />
    //   </Form.Group>
    //   <Button variant="primary" type="submit" onClick={signInButtonPressed}>
    //     Submit
    //   </Button>
    // </Form>
    // <div>
    //   <input onChange={e => setLoginValue(e.target.value)} value={loginValue}></input>
    //   <input onChange={e => setPasswordValue(e.target.value)} value={passwordValue}></input>
    //   <input type="submit" onClick={signInButtonPressed}></input>
    // </div>
    // <View style={styles.mainContainer}>
    //   <Image
    //     source={require("../images/logo.png")}
    //     style={styles.logoImage}
    //   ></Image>
    //   <TextInput
    //     style={styles.inputStyle}
    //     value={loginValue}
    //     onChangeText={(text) => setLoginValue(text)}
    //     placeholder="Login"
    //   ></TextInput>
    //   <TextInput
    //     style={styles.inputStyle}
    //     value={passwordValue}
    //     onChangeText={(text) => setPasswordValue(text)}
    //     placeholder="Password"
    //   ></TextInput>
    //   <View style={styles.rememberMeBox}>
    //     <CheckBox
    //       value={rememberIsSelected}
    //       onValueChange={setRemember}
    //       style={styles.rememberMe}
    //     />
    //     <Text style={styles.rememberMeText}>Remember me</Text>
    //   </View>

    //   <Text style={styles.inputErrorText}>{errorText}</Text>
    //   <TouchableOpacity
    //     style={styles.signInButton}
    //     onPress={signInButtonPressed}
    //   >
    //     <Text style={{ fontSize: 20 }}>Sign in</Text>
    //   </TouchableOpacity>
    //   <TouchableOpacity
    //     style={styles.signUpButton}
    //     onPress={signUpButtonPressed}
    //   >
    //     <Text style={{ fontSize: 20 }}>Sign up</Text>
    //   </TouchableOpacity>
    //   <ActivityIndicator
    //     style={styles.loadIndicator}
    //     animating={loading}
    //     size="large"
    //     color="#67daf9"
    //   />
    // </View>
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
      setSessionTokenAndId,
    },
    dispatch
  );

const ConnectedLogInScreen = connect(
  mapStateToProps,
  mapDispatchToProps
)(LogInScreen);

export default ConnectedLogInScreen;
