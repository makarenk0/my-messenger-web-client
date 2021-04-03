import { createDrawerNavigator } from '@react-navigation/drawer';
import React, {useState, useEffect} from 'react';
import HomeScreen from './HomeScreen'
import OtherUsersScreen from './OtherUsersScreen'
import ConnectedDrawerContent from './DrawerContent'

const UserScreen = (props) => {

    const Drawer = createDrawerNavigator();
    return(
      <Drawer.Navigator drawerContent={(props) => <ConnectedDrawerContent {...props}/>}>
          <Drawer.Screen name="Chats" component={HomeScreen}/>
          <Drawer.Screen name="Other users" component={OtherUsersScreen} />
      </Drawer.Navigator>
    )
}

export default UserScreen