import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useEffect, useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {USER_LOGGEDIN_KEY} from '../../shared/Constants';
import {COLORS} from '../../shared/Styles';

export default function Home({navigation}) {
  const [userInfo, setUserInfo] = useState({});

  useEffect(() => {
    getUserInfo();
  }, []);

  const getUserInfo = async () => {
    const info = await AsyncStorage.getItem(USER_LOGGEDIN_KEY);
    setUserInfo(JSON.parse(info));
  };

  const logout = async () => {
    await AsyncStorage.removeItem(USER_LOGGEDIN_KEY);
    navigation.reset({
      index: 0,
      routes: [{name: 'AUTH'}],
    });
  };

  const createTask = () => {
    navigation.navigate('CREATE');
  };
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Hi {userInfo?.name}</Text>
        {userInfo?.isAdmin ? (
          <Text onPress={createTask} style={styles.createText}>
            Create
          </Text>
        ) : null}
      </View>
      <ScrollView
        style={styles.box}
        contentContainerStyle={{
          alignItems: 'center',
          justifyContent: 'center',
        }}></ScrollView>
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
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    padding: '3%',
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
    color: 'red',
    alignSelf: 'flex-end',
    margin: '3%',
  },
});
