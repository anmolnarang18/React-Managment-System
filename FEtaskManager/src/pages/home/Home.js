import React, {useEffect, useState} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import SelectDropdown from 'react-native-select-dropdown';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';

import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  TASKS_KEY,
  TASK_STATUS,
  USER_LOGGEDIN_KEY,
  USER_STATUS,
} from '../../shared/Constants';
import {COLORS} from '../../shared/Styles';

const handleTaskStatus = status => {
  switch (status) {
    case TASK_STATUS.NOT_STARTED:
      return 'Start';

    case TASK_STATUS.IN_PROGRESS:
      return 'Complete';

    default:
      return 'Stopped';
  }
};

const handleTaskStatusChange = status => {
  switch (status) {
    case TASK_STATUS.NOT_STARTED:
      return TASK_STATUS.IN_PROGRESS;

    case TASK_STATUS.IN_PROGRESS:
      return TASK_STATUS.COMPLETED;

    default:
      return TASK_STATUS.TERMINATED;
  }
};

export default function Home({navigation}) {
  const [userInfo, setUserInfo] = useState({});

  const [tasks, setTasks] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState(TASK_STATUS.NOT_STARTED);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getUserInfo();
  }, []);

  const getUserInfo = async () => {
    let info = await AsyncStorage.getItem(USER_LOGGEDIN_KEY);
    info = JSON.parse(info);
    setUserInfo(info);
    fetchTasks(info, selectedStatus);
  };

  const fetchTasks = (info, status) => {
    setIsLoading(true);
    axios
      .get('http://localhost:8000/task/getAllTasks', {
        params: {
          status,
        },
        headers: {
          'content-type': 'application/json',
          Authorization: `Bearer: ${info ? info.token : userInfo.token}`,
        },
      })
      .then(resp => {
        setTasks(resp.data.data);
        setIsLoading(false);
      })
      .catch(err => {
        console.log('TASK ERROR', err);
        setIsLoading(false);
      });
  };

  const handleFetchedTasks = (info, status) => {
    if (selectedStatus == status) {
      fetchTasks(info, status);
    }
  };

  const handleNewTaskFetched = (info, status) => {
    setSelectedStatus(status);
    fetchTasks(info, status);
  };

  const logout = async () => {
    await AsyncStorage.removeItem(USER_LOGGEDIN_KEY);
    navigation.reset({
      index: 0,
      routes: [{name: 'AUTH'}],
    });
  };

  const createProject = () => {
    navigation.navigate('CREATE', {
      userInfo,
      handleFetchedTasks,
    });
  };

  const addMember = () => {
    navigation.navigate('MEMBER_SIGNUP', {
      userInfo,
    });
  };

  const onTaskClick = data => {
    navigation.navigate('DETAIL', {
      taskInfo: data,
      userInfo,
      handleNewTaskFetched,
    });
  };

  const onTaskBtnPress = async data => {
    if (data.status === TASK_STATUS.IN_PROGRESS) {
      onTaskClick(data);
      return;
    }

    const {dependentTask: depTask} = data;

    if (
      depTask &&
      (depTask.status === TASK_STATUS.IN_PROGRESS ||
        depTask.status === TASK_STATUS.NOT_STARTED)
    ) {
      Alert.alert(
        'Warning',
        `${depTask.name}(${depTask._id}) task is not completed yet`,
      );
      return;
    } else {
      axios
        .put(
          'http://localhost:8000/task/updateTask',
          {
            taskId: data._id,
            status: TASK_STATUS.IN_PROGRESS,
          },
          {
            headers: {
              'content-type': 'application/json',
              Authorization: `Bearer: ${userInfo.token}`,
            },
          },
        )
        .then(() => {
          const taskList = [...tasks];

          const updatedTasks = taskList.filter(e => e._id !== data._id);
          setTasks([...updatedTasks]);
        })
        .catch(err => {
          console.log('ERR', err?.response?.data);
        });
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={tasks}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.container}
        ListEmptyComponent={() => (
          <View
            style={{
              width: '100%',
              height: '90%',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text style={{fontSize: 20, fontWeight: '700'}}>
              No Tasks found!
            </Text>
          </View>
        )}
        ListHeaderComponent={() => (
          <View style={styles.headerContainer}>
            <View style={styles.row}>
              <Text numberOfLines={1} style={styles.headerText}>
                Hi, {userInfo.name}
              </Text>

              <SelectDropdown
                data={[
                  TASK_STATUS.NOT_STARTED,
                  TASK_STATUS.IN_PROGRESS,
                  TASK_STATUS.COMPLETED,
                ]}
                onSelect={(selectedItem, index) => {
                  setSelectedStatus(selectedItem);
                  fetchTasks(userInfo, selectedItem);
                }}
                defaultValue={selectedStatus}
                defaultButtonText="Select any task status"
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
                  return selectedItem;
                }}
                rowTextForSelection={(item, index) => {
                  // text represented for each item in dropdown
                  // if data array is an array of objects then return item.property to represent item in dropdown
                  return item;
                }}
              />
            </View>

            {userInfo.status == USER_STATUS.ADMIN && (
              <View style={styles.row}>
                <Text
                  onPress={addMember}
                  style={[styles.createText, {color: COLORS.primary}]}>
                  + Add Member
                </Text>
                <Text onPress={createProject} style={styles.createText}>
                  Create Task +
                </Text>
              </View>
            )}
          </View>
        )}
        renderItem={({item}) => {
          return (
            <TouchableOpacity
              onPress={() => onTaskClick(item)}
              style={styles.box}>
              <View style={styles.row}>
                <Text style={{fontSize: 16, fontWeight: '700'}}>
                  {item.name}
                </Text>
                <Text style={{fontSize: 14, fontWeight: '400'}}>
                  {item.status}
                </Text>
              </View>
              <Text
                numberOfLines={2}
                style={{fontSize: 14, fontWeight: '400', marginTop: '2%'}}>
                {item.description}
              </Text>
              <View style={styles.row}>
                <Text
                  style={{fontSize: 12, fontWeight: '400', marginTop: '2%'}}>
                  <Text style={{fontWeight: '600'}}>Start Date:</Text>{' '}
                  {moment(item.createdDate).format('DD/MMM/YY')}
                </Text>

                <Text
                  style={{fontSize: 12, fontWeight: '400', marginTop: '2%'}}>
                  <Text style={{fontWeight: '600'}}>End Date:</Text>{' '}
                  {moment(item.endDate).format('DD/MMM/YY')}
                </Text>
              </View>

              <View style={styles.row}>
                {userInfo.status == USER_STATUS.ADMIN ? (
                  <Text
                    style={{fontSize: 14, fontWeight: '400', marginTop: '3%'}}>
                    <Text style={{fontWeight: '600'}}>Assigned To:</Text>{' '}
                    {item.assignedTo.name}
                  </Text>
                ) : (
                  <>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '400',
                        marginTop: '3%',
                      }}>
                      <Text style={{fontWeight: '600'}}>Created By:</Text>{' '}
                      {item.createdBy.name}
                    </Text>
                    {item.status !== TASK_STATUS.COMPLETED &&
                      item.status !== TASK_STATUS.TERMINATED && (
                        <TouchableOpacity
                          style={styles.btnText}
                          onPress={() => onTaskBtnPress(item)}>
                          <Text>{handleTaskStatus(item.status)}</Text>
                        </TouchableOpacity>
                      )}
                  </>
                )}

                {item.status === TASK_STATUS.COMPLETED && (
                  <Text
                    style={{fontSize: 14, fontWeight: '400', marginTop: '3%'}}>
                    <Text style={{fontWeight: '600'}}>Total Cost:</Text> $
                    {item.totalHours * item.perHourCost}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
      />
      <Text onPress={logout} style={styles.logoutText}>
        Log out
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flex: 1,
    // alignItems: 'center',
    backgroundColor: '#fff',
    padding: '3%',
    width: '100%',
  },
  box: {
    backgroundColor: COLORS.primary,
    padding: '3%',
    width: '100%',
    borderColor: 'grey',
    borderWidth: 1,
    borderRadius: 10,
    display: 'flex',
    marginVertical: '3%',
  },
  headerContainer: {
    display: 'flex',
    // alignItems: 'center',
    // justifyContent: 'space-between',
    // flexDirection: 'row',
    width: '100%',
    marginBottom: '3%',
  },
  headerText: {
    fontSize: 20,
    fontWeight: '700',
  },
  createText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
    alignSelf: 'flex-end',
    margin: '5%',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginBottom: '2%',
  },
  btnText: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: '3%',
    borderWidth: 1,
    paddingVertical: '2%',
    paddingHorizontal: '5%',
    borderRadius: 5,
    color: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  dropdown1BtnStyle: {
    // width: '90%',
    height: 40,
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
    alignSelf: 'center',
  },
  dropdown1BtnTxtStyle: {color: '#444', textAlign: 'left', fontSize: 14},
  dropdown1DropdownStyle: {backgroundColor: '#EFEFEF'},
  dropdown1RowStyle: {
    backgroundColor: '#EFEFEF',
    borderBottomColor: '#C5C5C5',
  },
});
