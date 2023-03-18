import {FlatList, StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
import React, {useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {USER_MEMBER_KEY} from '../../shared/Constants';
import {COLORS} from '../../shared/Styles';

export default function MembersList({navigation, route}) {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    let list = await AsyncStorage.getItem(USER_MEMBER_KEY);
    list = JSON.parse(list) || [];
    const {memberDetail} = route.params;

    const membersList = (list || []).map(item => {
      if (memberDetail.data && memberDetail.data.email === item.email) {
        return {
          isSelected: true,
          ...item,
        };
      }

      return {
        isSelected: false,
        ...item,
      };
    });
    setMembers(membersList);
  };

  const handleMemberPress = data => {
    route.params.memberSelected(data);
    navigation.goBack();
  };

  return (
    <FlatList
      data={members}
      keyExtractor={i => i.email}
      contentContainerStyle={styles.container}
      ListEmptyComponent={() => <Text>No Members found!</Text>}
      ListHeaderComponent={() => (
        <View style={[styles.rowStyling, {marginBottom: '5%'}]}>
          <View style={styles.headingContainer}>
            <Icon
              onPress={() => navigation.goBack()}
              name="arrowleft"
              style={{alignSelf: 'flex-start', fontSize: 30, marginRight: '5%'}}
            />
            <Text style={styles.headerText}>Members List</Text>
          </View>

          {/* <Text
            onPress={handleSubmit}
            style={{color: COLORS.secondary, fontSize: 16}}>
            Save
          </Text> */}
        </View>
      )}
      renderItem={({item}) => (
        <TouchableOpacity
          onPress={() => handleMemberPress(item)}
          style={[
            styles.memberItemContainer,
            styles.rowStyling,
            {borderColor: item.isSelected ? COLORS.secondary : '#000'},
            {borderWidth: item.isSelected ? 2 : 1},
          ]}>
          <Text>{`${item.name} (${item.email})`}</Text>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flex: 1,
    padding: '5%',
    backgroundColor: COLORS.primary,
  },
  headerText: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: '5%',
  },
  input: {
    width: '30%',
    borderBottomWidth: 0.5,
    borderRadius: 3,
    textAlign: 'center',
    padding: '3%',
  },
  rowStyling: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  memberItemContainer: {
    borderWidth: 1,
    borderRadius: 10,
    padding: '5%',
    marginVertical: '3%',
    backgroundColor: '#fff',
  },
  headingContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
});
