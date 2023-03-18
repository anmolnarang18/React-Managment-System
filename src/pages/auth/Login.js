import {
  ActivityIndicator,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  EMAIL_VALIDATION,
  USER_ADMIN_KEY,
  USER_LOGGEDIN_KEY,
  USER_MEMBER_KEY,
} from '../../shared/Constants';
import {COLORS} from '../../shared/Styles';
import {handleValidation} from '../../utils/Validations';

export default function Login({navigation}) {
  const [email, setEmail] = useState({
    val: '',
    isValid: true,
    errMsg: '',
  });
  const [password, setPassword] = useState({
    val: '',
    isValid: true,
    errMsg: '',
  });

  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    isUserLoggedIn();
  }, []);

  const isUserLoggedIn = async () => {
    let info = await AsyncStorage.getItem(USER_LOGGEDIN_KEY);
    info = info ? JSON.parse(info) : null;

    setIsLoading(false);

    if (info?.email) {
      navigation.replace('HOME');
    }
  };

  const handleSubmit = async () => {
    const emailValidation = handleValidation(email.val, 'EMAIL');
    const passValidation = handleValidation(password.val, 'PASSWORD');

    if (!emailValidation.isValid || !passValidation.isValid) {
      setEmail(emailValidation);
      setPassword(passValidation);
      return;
    }

    let expectedData = [];
    if (isAdmin) {
      expectedData = await AsyncStorage.getItem(USER_ADMIN_KEY);
    } else {
      expectedData = await AsyncStorage.getItem(USER_MEMBER_KEY);
    }

    expectedData = JSON.parse(expectedData) || [];

    const isUserAdded = expectedData.filter(e => e.email === email.val);

    if (isUserAdded.length === 0) {
      setError('User not found');
      return;
    }

    setError('');
    await AsyncStorage.setItem(
      USER_LOGGEDIN_KEY,
      JSON.stringify(isUserAdded[0]),
    );
    //Navigate from here
    navigation.replace('HOME');
  };

  const toggleSwitch = () => {
    setIsAdmin(prev => !prev);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, {justifyContent: 'center'}]}>
        <ActivityIndicator size="large" />
        <Text style={styles.inputText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Login</Text>

      <View style={styles.box}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputText}>Email Address</Text>
          <TextInput
            value={email.val}
            placeholder="Please Enter Email address"
            textContentType="emailAddress"
            autoCapitalize="none"
            autoComplete="email"
            onChangeText={val =>
              setEmail({
                isValid: true,
                errMsg: '',
                val: val,
              })
            }
            style={styles.input}
          />
          {!email.isValid && <Text style={styles.errText}>{email.errMsg}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputText}>Password</Text>
          <TextInput
            value={password.val}
            placeholder="Please Enter Password"
            textContentType="password"
            autoComplete="password"
            autoCapitalize="none"
            onChangeText={val =>
              setPassword({
                isValid: true,
                errMsg: '',
                val: val,
              })
            }
            secureTextEntry
            style={styles.input}
          />
          {!password.isValid && (
            <Text style={styles.errText}>{password.errMsg}</Text>
          )}
        </View>

        <View style={styles.switchContainer}>
          <Text
            style={[
              {color: isAdmin ? 'grey' : COLORS.primary},
              styles.inputText,
            ]}>
            Member
          </Text>
          <Switch
            trackColor={{false: '#767577', true: COLORS.primary}}
            thumbColor={isAdmin ? '#fff' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleSwitch}
            style={styles.switch}
            value={isAdmin}
          />

          <Text
            style={[
              {color: isAdmin ? COLORS.primary : 'grey'},
              styles.inputText,
            ]}>
            Admin
          </Text>
        </View>

        <Text style={[styles.errText, {marginBottom: '3%'}]}>{error}</Text>

        <TouchableOpacity style={styles.btn} onPress={handleSubmit}>
          <Text>Submit</Text>
        </TouchableOpacity>
      </View>

      <Text
        onPress={() => navigation.replace('SIGNUP')}
        style={styles.linkText}>
        Don't have an account? Signup here
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flex: 1,
    alignItems: 'center',
    paddingTop: '30%',
    backgroundColor: COLORS.primary,
    // justifyContent: 'center',
  },
  box: {
    backgroundColor: '#fff',
    paddingVertical: '5%',
    width: '90%',
    borderColor: 'grey',
    borderWidth: 1,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '10%',
  },
  btn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: '5%',
    paddingVertical: '3%',
    borderRadius: 50,
    width: '80%',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: '700',
  },
  inputContainer: {
    marginTop: '5%',
    marginBottom: '2%',
    width: '100%',
    paddingHorizontal: '5%',
  },
  input: {
    backgroundColor: '#fff',
    borderColor: 'grey',
    borderWidth: 1,
    padding: '2%',
  },
  inputText: {
    fontSize: 14,
    fontWeight: '400',
    marginBottom: '2%',
  },
  errText: {
    fontSize: 12,
    fontWeight: '400',
    color: 'red',
    marginTop: '1%',
  },
  linkText: {
    fontSize: 12,
    fontWeight: '400',
    color: COLORS.link,
    marginTop: '5%',
  },
  switchContainer: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
  },
  switch: {
    marginHorizontal: '3%',
    marginVertical: '3%',
  },
});
