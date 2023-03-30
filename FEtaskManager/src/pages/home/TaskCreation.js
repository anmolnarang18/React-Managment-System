import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import SelectDropdown from 'react-native-select-dropdown';
import axios from 'axios';

import Icon from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import moment from 'moment';
import {COLORS} from '../../shared/Styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {handleValidation} from '../../utils/Validations';
import {TASKS_KEY, TASK_STATUS} from '../../shared/Constants';

export default function TaskCreation({navigation, route}) {
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

  const [wage, setWage] = useState({
    isValid: true,
    errMsg: '',
    val: '5',
  });

  const [memberDetail, setMemberDetail] = useState({
    isValid: true,
    errMsg: '',
    data: null,
  });

  const [createdDate, setCreatedDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const [openCDate, setOpenCDate] = useState(false);
  const [openEDate, setOpenEDate] = useState(false);

  const [selectedTask, setSelectedTask] = useState({
    name: 'Not dependent',
    id: null,
  });
  const [taskList, setTaskList] = useState([]);

  const {userInfo, handleFetchedTasks} = route.params;

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = info => {
    axios
      .get('http://localhost:8000/task/getAllTasks', {
        headers: {
          'content-type': 'application/json',
          Authorization: `Bearer: ${userInfo.token}`,
        },
      })
      .then(resp => {
        console.log('TASKS', resp.data);
        let tasks = resp.data.data;
        tasks = tasks.map(item => {
          return {
            name: item.name,
            id: item._id,
          };
        });

        setTaskList([
          {
            name: 'Not dependent',
            id: '',
          },
          ...tasks,
        ]);
      })
      .catch(err => {
        console.log('TASK ERROR', err);
      });
  };

  const handleBack = async () => {
    navigation.goBack();
  };

  const memberSelected = data => {
    setMemberDetail({
      isValid: true,
      errMsg: '',
      data,
    });
  };

  const handleSubmit = async () => {
    if (!memberDetail.data) {
      setMemberDetail({
        isValid: false,
        errMsg: 'Please assign any member to this task',
        data: null,
      });
      return;
    }

    const nameValidation = handleValidation(name.val, 'STRING', 'task name');
    const descValidation = handleValidation(
      desc.val,
      'STRING',
      'task description',
    );
    const wageValidation = handleValidation(
      wage.val,
      'NUMBER',
      'per hour wage',
    );

    if (
      !nameValidation.isValid ||
      !descValidation.isValid ||
      !wageValidation.isValid
    ) {
      setDesc(descValidation);
      setName(nameValidation);
      setWage(wageValidation);
      return;
    }

    const taskDetails = {
      name: name.val,
      description: desc.val,
      createdDate,
      endDate,
      assignedTo: memberDetail.data._id,
      createdBy: userInfo._id,
      status: TASK_STATUS.NOT_STARTED,
      perHourCost: wage.val,
      totalHours: 0,
      dependentTask: selectedTask.id,
      completionDate: null,
    };

    axios
      .post('http://localhost:8000/task/createTask', taskDetails, {
        headers: {
          'content-type': 'application/json',
          Authorization: `Bearer: ${userInfo.token}`,
        },
      })
      .then(resp => {
        console.log('RESPONSE', resp.data);
        handleFetchedTasks(userInfo, TASK_STATUS.NOT_STARTED);
        navigation.goBack();
      })
      .catch(err => {
        console.log('TASK_CREATION ERROR', err);
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
          width: '100%',
        }}>
        <Icon
          onPress={handleBack}
          name="arrowleft"
          style={{alignSelf: 'flex-start', fontSize: 30, marginRight: '5%'}}
        />
        <Text style={styles.headerText}>Create New Task</Text>
      </View>

      {memberDetail.data ? (
        <View style={styles.memberContainer}>
          <View style={{display: 'flex', flex: 1, flexDirection: 'column'}}>
            <Text>Name: {memberDetail.data.name}</Text>
            <Text numberOfLines={1}>Email: {memberDetail.data.email}</Text>
          </View>
          <TextInput
            value={wage.val}
            keyboardType="numeric"
            maxLength={3}
            onChangeText={val =>
              setWage({
                isValid: true,
                errMsg: '',
                val,
              })
            }
            style={[styles.input, {width: '30%', textAlign: 'center'}]}
          />
        </View>
      ) : null}

      <View style={styles.box}>
        {!memberDetail.isValid ? (
          <Text style={styles.errText}>{memberDetail.errMsg}</Text>
        ) : !wage.isValid ? (
          <Text style={styles.errText}>{wage.errMsg}</Text>
        ) : null}
        <View style={styles.inputContainer}>
          <Text style={styles.inputText}>Name</Text>
          <TextInput
            value={name.val}
            placeholder="Please enter task name"
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
          <Text style={styles.inputText}>Description</Text>
          <TextInput
            value={desc.val}
            placeholder="Please enter task description"
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

        <View style={styles.dateContainer}>
          <View>
            <Text
              onPress={() => setOpenCDate(prev => !prev)}
              style={styles.inputText}>
              Created date
            </Text>
            <DatePicker
              modal
              minimumDate={new Date()}
              open={openCDate}
              date={createdDate}
              onConfirm={date => {
                setOpenCDate(prev => !prev);
                setCreatedDate(date);
                if (moment(endDate).diff(date) < 0) {
                  setEndDate(date);
                }
              }}
              onCancel={() => {
                setOpenCDate(prev => !prev);
              }}
            />

            <Text onPress={() => setOpenCDate(true)} style={styles.inputText}>
              {moment(createdDate).format('DD/M/YYYY')}
            </Text>
          </View>

          <View>
            <Text
              onPress={() => setOpenEDate(prev => !prev)}
              style={styles.inputText}>
              Last date
            </Text>
            <DatePicker
              modal
              open={openEDate}
              minimumDate={createdDate}
              date={endDate}
              onConfirm={date => {
                setOpenEDate(prev => !prev);
                setEndDate(date);
              }}
              onCancel={() => {
                setOpenEDate(prev => !prev);
              }}
            />

            <Text onPress={() => setOpenEDate(true)} style={styles.inputText}>
              {moment(endDate).format('DD/M/YYYY')}
            </Text>
          </View>
        </View>

        <Text
          onPress={() =>
            navigation.navigate('LIST', {
              memberSelected,
              memberDetail: memberDetail.data,
              userInfo: route.params.userInfo,
            })
          }
          style={styles.addText}>
          + Assign member
        </Text>

        <View style={{marginVertical: '2%', paddingHorizontal: '5%'}}>
          <Text>Select Dependent Task</Text>
          <SelectDropdown
            data={taskList}
            onSelect={(selectedItem, index) => {
              setSelectedTask(selectedItem);
            }}
            defaultValue={selectedTask}
            defaultButtonText="Select task (if any)"
            buttonStyle={styles.dropdown1BtnStyle}
            buttonTextStyle={styles.dropdown1BtnTxtStyle}
            renderDropdownIcon={isOpened => {
              return (
                <FontAwesome
                  name={isOpened ? 'chevron-up' : 'chevron-down'}
                  color={'#444'}
                  size={18}
                />
              );
            }}
            dropdownIconPosition={'right'}
            dropdownStyle={styles.dropdown1DropdownStyle}
            rowStyle={styles.dropdown1RowStyle}
            rowTextStyle={styles.dropdown1BtnTxtStyle}
            buttonTextAfterSelection={(selectedItem, index) => {
              // text represented after item is selected
              // if data array is an array of objects then return selectedItem.property to render after item is selected
              return `${selectedItem.name}(${selectedItem.id})`;
            }}
            rowTextForSelection={(item, index) => {
              // text represented for each item in dropdown
              // if data array is an array of objects then return item.property to represent item in dropdown
              console.log('ITEM', item);
              return `${item.name}(${item.id})`;
            }}
          />
        </View>

        <TouchableOpacity style={styles.btn} onPress={handleSubmit}>
          <Text style={styles.btnText}>Create Task</Text>
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
    backgroundColor: COLORS.primary,
    padding: '5%',
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
  dropdown1BtnStyle: {
    width: '90%',
    height: 40,
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
    alignSelf: 'center',
    marginTop: '3%',
  },
  dropdown1BtnTxtStyle: {color: '#444', textAlign: 'left', fontSize: 14},
  dropdown1DropdownStyle: {backgroundColor: '#EFEFEF'},
  dropdown1RowStyle: {
    backgroundColor: '#EFEFEF',
    borderBottomColor: '#C5C5C5',
  },

  memberContainer: {
    backgroundColor: COLORS.primary,
    alignSelf: 'center',
    padding: '5%',
    marginTop: '3%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerText: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: '5%',
  },
  dateContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: '5%',
    marginTop: '3%',
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
    marginLeft: '5%',
    alignSelf: 'center',
  },
  addText: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.secondary,
    padding: '3%',
    alignSelf: 'flex-end',
  },
  btn: {
    marginTop: '5%',
    marginBottom: '2%',
    width: '80%',
    padding: '3%',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    borderRadius: 30,
    alignSelf: 'center',
  },
  btnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
