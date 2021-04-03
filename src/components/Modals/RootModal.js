import * as React from 'react';
import {useRef} from 'react';
import {Modal, Button, View, StyleSheet, Animated, Easing} from 'react-native';
import {connect} from 'react-redux';
import Error from './Error';
import Loading from './Loading';

const Modals = {
  Error: Error,
  Loading: Loading,
};

const RootModal = (props) => {
  const {id, parametrs} = props;
  const ModalView = Modals[id] || function () {};
  const transAnim = useRef(new Animated.Value(-40)).current;

  Animated.timing(transAnim, {
    toValue: 0,
    duration: 1000,
    useNativeDriver: true,
    easing: Easing.bounce,
  }).start();

  return Boolean(id) ? (
    <Animated.View
      style={{
        width: '100%',
        position: 'absolute',
        translateY: transAnim,
        height: 40,
      }}>
      <ModalView {...parametrs} />
    </Animated.View>
  ) : null;
};

const mapStateToProps = (state) => {
  return {
    id: state.ModalReducer.id,
    parametrs: state.ModalReducer.parametrs,
  };
};

const ConnectedRootModal = connect(mapStateToProps)(RootModal);

export default ConnectedRootModal;
