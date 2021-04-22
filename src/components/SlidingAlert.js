import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  Modal,
  Button,
  Alert,
  Image,
  TouchableOpacity,
  TextInput,
} from 'react-native';

const SlidingAlert = (props) => {

  
    const [visible, setVisibility] = useState(false);
    const [text, setText] = useState("");

    SlidingAlert.show = function(){
        setVisibility(true)
        setText(text)
    }
    
  
    return(
  
      <Modal visible={visible}>
         <Text>{text}</Text>
      </Modal>
    )
  }

  export default SlidingAlert