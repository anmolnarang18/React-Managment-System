import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  View,
} from 'react-native';
import React, {useState} from 'react';
import axios from 'axios';
import Icon from 'react-native-vector-icons/AntDesign';

import {COLORS} from '../../shared/Styles';
import {USER_STATUS} from '../../shared/Constants';
import {handleValidation} from '../../utils/Validations';

export default function Member_Signup({navigation, route}) {
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
    const nameValidation = handleValidation(name.val, 'STRING', 'name');

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

    axios
      .post('http://localhost:8000/user/signup', {
        name: name.val,
        email: email.val,
        password: password.val,
        status: USER_STATUS.MEMBER,
        createdBy: route.params.userInfo._id,
      })
      .then(async resp => {
        console.log('RESPONSE SIGNUP', resp.data.data);

        //Navigate from here
        navigation.goBack();
      })
      .catch(err => {
        console.log('SIGNUP ERROR', err);
        setError(err?.response?.data || 'Something went wrong!');
      });
  };

  return (
    <View style={styles.container}>
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-start',
          marginLeft: '3%',
          width: '100%',
        }}>
        <Icon
          onPress={() => navigation.goBack()}
          name="arrowleft"
          style={{alignSelf: 'flex-start', fontSize: 30, marginRight: '5%'}}
        />
        <Text style={styles.headerText}>Member Signup</Text>
      </View>

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
          <Text style={styles.inputText}>Email</Text>
          <TextInput
            value={email.val}
            textContentType="emailAddress"
            autoComplete="email"
            autoCapitalize="none"
            placeholder="Please Enter Your Email address"
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

        <Text style={[styles.errText, {marginBottom: '3%'}]}>{error}</Text>

        <TouchableOpacity style={styles.btn} onPress={handleSubmit}>
          <Text>Sign up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flex: 1,
    alignItems: 'center',
    paddingTop: '10%',
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
    borderBottomWidth: 1,
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
});
