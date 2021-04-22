import {combineReducers} from 'redux';
import {createReducer} from '@reduxjs/toolkit';

const INITIAL_STATE = {};

const alertReducer = (state = INITIAL_STATE, action) => {
  switch(action.type){
    case 'SHOW_ALERT':
      return action.payload
    case 'HIDE_ALERT':
      return action.payload
    default:
      return {}
  }
  
}

// const MODAL_PROPS_INITIAL_STATE = {};

// const modalProps = createReducer(MODAL_PROPS_INITIAL_STATE, {
//   ['MODAL__SET_MODAL_PROPS'](state, {payload}) {
//     return payload;
//   },
// });

export const ModalReducer = alertReducer
