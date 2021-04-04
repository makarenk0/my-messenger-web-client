import {combineReducers} from 'redux';

const INITIAL_STATE = {
  current: {},
};

const localDBReducer = (state = INITIAL_STATE, action) => {
  const {current} = state;

  switch (action.type) {
    case 'LOAD_DB':
      return {current};
    case 'SAVE_DOC':
      localStorage.setItem(action.payload.docToSave._id, JSON.stringify(action.payload.docToSave));
      action.payload.callback()
      return state;
    case 'LOAD_DOC':
      let itemFound = localStorage.getItem(action.payload._id);
      action.payload.callback(itemFound == null ? [] : [JSON.parse(itemFound)])
      return state;
    case 'REMOVE_DOC':
      //TO DO: implement
      // current.DB.remove(
      //   action.payload.parametrsObj,
      //   {multi: action.payload.multi},
      //   action.payload.callback,
      // );
      return state;
    case 'ADD_ONE_TO_ARRAY':
      let itemFoundArr = JSON.parse(localStorage.getItem(action.payload._id));
      itemFoundArr[action.payload.fieldName].push(action.payload.toAdd)
      localStorage.setItem(itemFoundArr._id, JSON.stringify(itemFoundArr));
      action.payload.callback()
      return state;
    case 'ADD_MANY_TO_ARRAY':
      let itemFoundArrMany = JSON.parse(localStorage.getItem(action.payload._id));
      itemFoundArrMany[action.payload.fieldName].push(...action.payload.toAdd)
      localStorage.setItem(itemFoundArrMany._id, JSON.stringify(itemFoundArrMany));
      action.payload.callback()
      return state;
    case 'REMOVE_FROM_ARRAY':
       //TO DO: implement
      // current.DB.update(
      //   action.payload.parametrsObj,
      //   {$pull: action.payload.toRemove},
      //   {},
      //   action.payload.callback,
      // );
      return state;
    case 'UPDATE_VALUE':
      let itemFoundToUpdate = JSON.parse(localStorage.getItem(action.payload._id));
      Object.keys(action.payload.toUpdate).forEach((el) =>{
        itemFoundToUpdate[el] = action.payload.toUpdate[el]
      })
      localStorage.setItem(itemFoundToUpdate._id, JSON.stringify(itemFoundToUpdate));
      action.payload.callback()
      return state;
    case 'GET_PROJECTED':
      let wholeObj = JSON.parse(localStorage.getItem(action.payload._id));
      let projectionProm = {}
      action.payload.projection.forEach(element => {
        projectionProm[element] = wholeObj[element]
      });
      action.payload.callback([projectionProm]);
    default:
      return state;
  }
};

export default combineReducers({
  localDb: localDBReducer,
});
