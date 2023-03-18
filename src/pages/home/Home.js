import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import React, {useEffect, useState} from 'react';
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

  useEffect(() => {
    getUserInfo();
  }, []);

  const getUserInfo = async () => {
    let info = await AsyncStorage.getItem(USER_LOGGEDIN_KEY);
    info = JSON.parse(info);
    setUserInfo(info);
    fetchTasks(info);
  };

  const logout = async () => {
    await AsyncStorage.removeItem(USER_LOGGEDIN_KEY);
    navigation.reset({
      index: 0,
      routes: [{name: 'AUTH'}],
    });
  };

  const fetchTasks = async info => {
    let taskList = await AsyncStorage.getItem(TASKS_KEY);

    taskList = JSON.parse(taskList) || [];

    const requiredTasks = [];

    const user = info || userInfo;

    if (user.isAdmin) {
      taskList.map(item => {
        if (item.createdBy.email === user.email) {
          requiredTasks.push(item);
        }
      });
    } else {
      taskList.map(item => {
        if (item.assignedTo.email === user.email) {
          requiredTasks.push(item);
        }
      });
    }

    setTasks([...requiredTasks]);
  };

  const createProject = () => {
    navigation.navigate('CREATE', {
      userInfo,
      fetchTasks,
    });
  };

  const onTaskClick = data => {
    navigation.navigate('DETAIL', {taskInfo: data, userInfo, fetchTasks});
  };

  const onTaskBtnPress = async data => {
    if (data.status === TASK_STATUS.IN_PROGRESS) {
      onTaskClick(data);
      return;
    }

    const list = [...tasks];

    if (data.dependentTask) {
      let taskList = await AsyncStorage.getItem(TASKS_KEY);

      taskList = JSON.parse(taskList) || [];

      const depTask = taskList.filter(e => e.id === data.dependentTask);

      if (depTask.length > 0) {
        if (depTask[0].status !== TASK_STATUS.COMPLETED) {
          Alert.alert(
            'Warning',
            `${depTask[0].name}(${depTask[0].id}) task is not completed yet`,
          );
          return;
        }
      }
    }

    const taskIndex = list.findIndex(
      e => e.id === data.id || e.createdDate === data.createdDate,
    );

    if (taskIndex !== -1) {
      list[taskIndex].status = handleTaskStatusChange(list[taskIndex].status);
    }

    await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(list));

    setTasks([...list]);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={tasks}
        keyExtractor={item => item.id}
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
            <Text style={styles.headerText}>Hi, {userInfo?.name}</Text>
            {userInfo.isAdmin && (
              <Text onPress={createProject} style={styles.createText}>
                + Create Task
              </Text>
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
                {userInfo.isAdmin ? (
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
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
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
});
