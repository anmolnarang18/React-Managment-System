import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Login from '../pages/auth/Login';
import Signup from '../pages/auth/Signup';

const AuthNavigation = () => {
  const Stack = createNativeStackNavigator();

  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="LOGIN" component={Login} />
      <Stack.Screen name="SIGNUP" component={Signup} />
    </Stack.Navigator>
  );
};

export default AuthNavigation;
