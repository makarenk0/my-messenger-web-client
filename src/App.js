import logo from "./logo.svg";
import "./App.css";
import "./App.scss"

import {Provider} from 'react-redux';
import {createStore} from 'redux';
import connectionReducer from './reducers/ConnectionReducer';
import { BrowserRouter, Route, Switch } from "react-router-dom";
import LogInScreen from './components/LogInScreen'
import {combineReducers} from 'redux';
import 'bootstrap/dist/css/bootstrap.min.css';

const store = createStore(combineReducers({connectionReducer}))


function App() {
  return (
   
    
      <BrowserRouter>
       <Provider store={store}>
        <div>
          <Switch>
            <Route path={"/"} exact component={LogInScreen} />
            {/* <Route path={"/signUp"} component={SignUpScreen} /> */}
          </Switch>
        </div>
        </Provider>
      </BrowserRouter>
  );
}

export default App;
