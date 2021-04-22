export const loadDB = (dbName) => (
    {
      type: 'LOAD_DB',
      payload: {'dbName': dbName}
    }
  );

export const saveDocToDB = (docToSave, callback) => (
    {
      type: 'SAVE_DOC',
      payload: {'docToSave': docToSave, 'callback': callback}
    }
  );

  export const loadDocFromDB = (_id, callback) => (
    {
      type: 'LOAD_DOC',
      payload: {'_id': _id, 'callback': callback}
    }
  );

  export const loadDocWithParams = (params, callback) => (
    {
      type: 'LOAD_DOC_WITH_PARAMS',
      payload: {'params': params, 'callback': callback}
    }
  );

  export const removeDocFromDB = (_id, callback) => (
    {
      type: 'REMOVE_DOC_BY_ID',
      payload: {'_id': _id, 'callback': callback}
    }
  );

  export const addOneToArray = (_id, fieldName, toAdd, callback) => (
    {
      type: 'ADD_ONE_TO_ARRAY',
      payload: {'_id': _id, 'fieldName': fieldName, 'toAdd': toAdd, 'callback': callback}
    }
  );

  export const addManyToArray = (_id, fieldName, toAdd, callback) => (
    {
      type: 'ADD_MANY_TO_ARRAY',
      payload: {'_id': _id, 'fieldName': fieldName, 'toAdd': toAdd, 'callback': callback}
    }
  );

  export const removeFromArray = (parametrsObj, toRemove, callback) => (
    {
      type: 'REMOVE_FROM_ARRAY',
      payload: {'parametrsObj': parametrsObj, 'toRemove': toRemove, 'callback': callback}
    }
  );

  export const removeManyFromArray = (_id, fieldName, removeParameterField, toRemove, callback) => (
    {
      type: 'REMOVE_MANY_FROM_ARRAY',
      payload: {'_id': _id, 'fieldName': fieldName, 'removeParameterField': removeParameterField, 'toRemove': toRemove, 'callback': callback}
    }
  );

  export const updateValue = (_id, toUpdate, callback) => (
    {
      type: 'UPDATE_VALUE',
      payload: {'_id': _id, 'toUpdate': toUpdate, 'callback': callback}
    }
  );

  export const getProjected = (_id, projection, callback) => (
    {
      type: 'GET_PROJECTED',
      payload: {'_id': _id, 'projection': projection, 'callback': callback}
    }
  );

  