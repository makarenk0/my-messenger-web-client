import Datastore from 'react-native-local-mongodb';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {combineReducers} from 'redux';

const INITIAL_STATE = {
  current: {},
};

const localDBReducer = (state = INITIAL_STATE, action) => {
  const {current} = state;

  switch (action.type) {
    case 'LOAD_DB':
      var db = new Datastore({
        filename: action.payload.dbName,
        storage: localStorage,
        autoload: true,
      });
      current['DB'] = db;
      return {current};
    case 'SAVE_DOC':
      current.DB.insert(action.payload.docToSave, action.payload.callback);
      return state;
    case 'LOAD_DOC':
      current.DB.find(action.payload.parametrsObj, action.payload.callback);
      return state;
    case 'REMOVE_DOC':
      current.DB.remove(
        action.payload.parametrsObj,
        {multi: action.payload.multi},
        action.payload.callback,
      );
      return state;
    case 'ADD_ONE_TO_ARRAY':
      current.DB.update(
        action.payload.parametrsObj,
        {$push: action.payload.toAdd},
        {},
        action.payload.callback,
      );
      return state;
    case 'ADD_MANY_TO_ARRAY':
      let toAdd = {};
      toAdd[action.payload.arrayField] = {$each: action.payload.toAdd};

      current.DB.update(
        action.payload.parametrsObj,
        {$push: toAdd},
        {},
        action.payload.callback,
      );
      return state;
    case 'REMOVE_FROM_ARRAY':
      current.DB.update(
        action.payload.parametrsObj,
        {$pull: action.payload.toRemove},
        {},
        action.payload.callback,
      );
      return state;
    case 'UPDATE_VALUE':
      current.DB.update(
        action.payload.parametrsObj,
        {$set: action.payload.toUpdate},
        {},
        action.payload.callback,
      );
      return state;
    case 'GET_PROJECTED':
      let projectionProm = current.DB.find(action.payload.parametrsObj)
        .projection(action.payload.projection)
        .exec();
      action.payload.callback(projectionProm);
    default:
      return state;
  }
};

export default combineReducers({
  localDb: localDBReducer,
});
