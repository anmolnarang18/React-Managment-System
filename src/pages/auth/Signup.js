import {
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  Text,
  View,
} from 'react-native';
import React, {useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {COLORS} from '../../shared/Styles';
import {
  EMAIL_VALIDATION,
  USER_ADMIN_KEY,
  USER_MEMBER_KEY,
} from '../../shared/Constants';

const handleValidation = (val, type) => {
  switch (type) {
    case 'EMAIL':
      if (!val || !EMAIL_VALIDATION.test(val)) {
        return {
          val: val,
          isValid: false,
          errMsg: 'Please enter valid email address',
        };
      } else {
        return {
          val: val,
          isValid: true,
          errMsg: '',
        };
      }
    case 'PASSWORD':
      if (!val || val.length < 6) {
        return {
          val: val,
          isValid: false,
          errMsg: 'Password must be atleast 6 characters long.',
        };
      } else {
        return {
          val: val,
          isValid: true,
          errMsg: '',
        };
      }

    case 'NAME':
      if (!val || val.length < 3) {
        return {
          val: val,
          isValid: false,
          errMsg: 'Please enter valid name',
        };
      } else {
        return {
          val: val,
          isValid: true,
          errMsg: '',
        };
      }

    default:
      break;
  }
};

export default function Signup({navigation}) {
  const [email, setEmail] = useState({
    val: '',
    isValid: true,
    errMsg: '',
  });

  const [name, setName] = useState({
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

  const handleSubmit = async () => {
    const emailValidation = handleValidation(email.val, 'EMAIL');
    const passValidation = handleValidation(password.val, 'PASSWORD');
    const nameValidation = handleValidation(name.val, 'NAME');

    if (
      !emailValidation.isValid ||
      !passValidation.isValid ||
      !nameValidation
    ) {
      setEmail(emailValidation);
      setPassword(passValidation);
      setName(nameValidation);
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

    if (isUserAdded.length > 0) {
      setError('User already added');
      return;
    }

    setError('');

    if (isAdmin) {
      await AsyncStorage.setItem(
        USER_ADMIN_KEY,
        JSON.stringify([
          {
            email: email.val,
            password: password.val,
            name: name.val,
            isAdmin,
          },
          ...expectedData,
        ]),
      );
    } else {
      await AsyncStorage.setItem(
        USER_MEMBER_KEY,
        JSON.stringify([
          {
            email: email.val,
            password: password.val,
            name: name.val,
            isAdmin,
          },
          ...expectedData,
        ]),
      );
    }

    //Navigate from here
    navigation.replace('HOME');
  };

  const toggleSwitch = () => {
    setIsAdmin(prev => !prev);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Signup</Text>

      <View style={styles.box}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputText}>Name</Text>
          <TextInput
            value={name.val}
            placeholder="Please Enter Your Name"
            textContentType="name"
            autoComplete="name"
            onChangeText={val =>
              setName({
                isValid: true,
                errMsg: '',
                val: val,
              })
            }
            style={styles.input}
          />
          {!name.isValid && <Text style={styles.errText}>{name.errMsg}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputText}>Email Address</Text>
          <TextInput
            value={email.val}
            textContentType="emailAddress"
            autoComplete="email"
            autoCapitalize="none"
            placeholder="Please Enter Email address"
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
            style={styles.input}
            secureTextEntry
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

      <Text onPress={() => navigation.replace('LOGIN')} style={styles.linkText}>
        Already have an account? Login here
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
