import logo from "./logo.svg";
import "./App.css";
import "react-datepicker/dist/react-datepicker.css";
import "./App.scss";

import { Provider } from "react-redux";
import { createStore } from "redux";
import connectionReducer from "./reducers/ConnectionReducer";
import localDBReducer from "./reducers/LocalDBReducer";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import LogInScreen from "./components/LogInScreen";
import SignUpScreen from "./components/SignUpScreen";
import HomeScreen from "./components/HomeScreen";
import { combineReducers } from "redux";
import "bootstrap/dist/css/bootstrap.min.css";

import { library } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";
import {
  faCheckSquare,
  faCoffee,
  faUser,
  faUsers,
  faBars,
  faPaperPlane,
  faAddressCard,
  faCommentDots,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";

library.add(
  fab,
  faCheckSquare,
  faCoffee,
  faUser,
  faUsers,
  faBars,
  faPaperPlane,
  faAddressCard,
  faCommentDots,
  faSignOutAlt
);

const store = createStore(
  combineReducers({ connectionReducer, localDBReducer })
);

function App() {
  return (
    <BrowserRouter>
      <Provider store={store}>
        <div>
          <Switch>
            <Route path={"/"} exact component={LogInScreen} />
            <Route path={"/signUp"} component={SignUpScreen} />
            <Route path={"/home"} component={HomeScreen} />
          </Switch>
        </div>
      </Provider>
    </BrowserRouter>
  );
}

export default App;
