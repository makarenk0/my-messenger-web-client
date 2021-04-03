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

  export const loadDocFromDB = (parametrsObj, callback) => (
    {
      type: 'LOAD_DOC',
      payload: {'parametrsObj': parametrsObj, 'callback': callback}
    }
  );

  export const removeDocFromDB = (parametrsObj, multi, callback) => (
    {
      type: 'REMOVE_DOC',
      payload: {'parametrsObj': parametrsObj, 'multi': multi, 'callback': callback}
    }
  );

  export const addOneToArray = (parametrsObj, toAdd, callback) => (
    {
      type: 'ADD_ONE_TO_ARRAY',
      payload: {'parametrsObj': parametrsObj, 'toAdd': toAdd, 'callback': callback}
    }
  );

  export const addManyToArray = (parametrsObj, arrayField, toAdd, callback) => (
    {
      type: 'ADD_MANY_TO_ARRAY',
      payload: {'parametrsObj': parametrsObj, 'arrayField': arrayField, 'toAdd': toAdd, 'callback': callback}
    }
  );

  export const removeFromArray = (parametrsObj, toRemove, callback) => (
    {
      type: 'REMOVE_FROM_ARRAY',
      payload: {'parametrsObj': parametrsObj, 'toRemove': toRemove, 'callback': callback}
    }
  );

  export const updateValue = (parametrsObj, toUpdate, callback) => (
    {
      type: 'UPDATE_VALUE',
      payload: {'parametrsObj': parametrsObj, 'toUpdate': toUpdate, 'callback': callback}
    }
  );

  export const getProjected = (parametrsObj, projection, callback) => (
    {
      type: 'GET_PROJECTED',
      payload: {'parametrsObj': parametrsObj, 'projection': projection, 'callback': callback}
    }
  );

  