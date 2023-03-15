import React, {useState} from 'react';
import {StyleSheet, Text, TextInput, View} from 'react-native';
import DatePicker from 'react-native-date-picker';

import {COLORS} from '../../shared/Styles';
export default function TaskCreation({navigation}) {
  const [name, setName] = useState({
    isValid: true,
    errMsg: '',
    val: '',
  });

  const [desc, setDesc] = useState({
    isValid: true,
    errMsg: '',
    val: '',
  });

  const [createdDate, setCreatedDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const [openCDate, setOpenCDate] = useState(false);
  const [openEDate, setOpenEDate] = useState(false);
  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Create New Task</Text>
      <View style={styles.box}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputText}>Email Address</Text>
          <TextInput
            value={name.val}
            placeholder="Please Enter Email address"
            textContentType="emailAddress"
            autoCapitalize="none"
            autoComplete="email"
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
            value={desc.val}
            placeholder="Please Enter Email address"
            textContentType="emailAddress"
            autoCapitalize="none"
            autoComplete="email"
            multiline
            onChangeText={val =>
              setDesc({
                isValid: true,
                errMsg: '',
                val: val,
              })
            }
            style={styles.input}
          />
          {!desc.isValid && <Text style={styles.errText}>{desc.errMsg}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <Text
            onPress={() => setOpenCDate(prev => !prev)}
            style={styles.inputText}>
            Created date
          </Text>
          <DatePicker
            modal
            open={openCDate}
            date={createdDate}
            onConfirm={date => {
              setOpenCDate(prev => !prev);
              setCreatedDate(date);
            }}
            onCancel={() => {
              setOpenCDate(prev => !prev);
            }}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    padding: '3%',
    paddingTop: '20%',
  },
  box: {
    backgroundColor: '#fff',
    paddingVertical: '5%',
    width: '100%',
    borderColor: 'grey',
    borderWidth: 1,
    borderRadius: 10,
    display: 'flex',
  },
  headerText: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: '5%',
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
});
