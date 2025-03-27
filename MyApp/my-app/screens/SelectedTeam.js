import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTeamData } from '../redux/slices/teamSlice';
//import { useAuth } from '../utils/useAuthentication';



const SelectedTeam = ({ navigation }, props) => {
  const dispatch = useDispatch();
  const teamData = useSelector((state) => state.team.teamData);
  const loading = useSelector((state) => state.team.loading);
  const error = useSelector((state) => state.team.error);

  useEffect(() => {
    if (!loading && !error && teamData.length === 0) {
      console.log('Dispatching fetchTeamData');
      dispatch(fetchTeamData());
    }
  }, []);

  const GoBack = () => {
    navigation.navigate('Home');
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.text}>Player Name: {item.playername}</Text>
      <Text style={styles.text}>Price: {item.price}</Text>
    </View>
    //TODO: Add more player details e.g Position, team
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.text}>Loading...</Text>
      </SafeAreaView>);
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.text}>Your Selected Team this week</Text>


      {error && <Text style={styles.error}>{error}</Text>}

      <View style={styles.list}>
        <FlatList
          data={teamData}
          renderItem={renderItem}
          keyExtractor={(item) => item.playerid.toString()}
        />
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.button} onPress={GoBack}>
          <Text style={styles.text}>Go Back</Text>
        </TouchableOpacity>



      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: '#1e78ff',
  },
  list: {
    flexGrow: 1,
  },
  text: {
    color: 'white',
    fontSize: 20,
    textAlign: 'center',
  },
  error: {
    color: 'red',
    fontSize: 20,
    textAlign: 'center',
  },
  item: {
    backgroundColor: '#333',
    padding: 10,
    marginVertical: 8,
    borderRadius: 5,
  },
  buttons: {
    marginTop: 20,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#5e3bf6',
    padding: 10,
    borderWidth: 2,
    borderColor: 'white',
    margin: 20,
  },
});

export default SelectedTeam;
