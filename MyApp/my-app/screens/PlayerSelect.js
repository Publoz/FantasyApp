import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, FlatList, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTeamData } from '../redux/slices/teamSlice';
//import { useAuth } from '../utils/useAuthentication';



const PlayerSelect = ({ navigation }, props) => {
  const dispatch = useDispatch();
  
  useEffect(() => {
    if (!loading && !error && teamData.length === 0) {
      console.log('Dispatching fetchTeamData');
      dispatch(fetchTeamData());
    }
  }, []);

  const GoBack = () => {
    navigation.navigate('Home');
  };

  const getPriceColor = (price) => {
    if (price >= 30) {
      return 'red';
    } else if (price > 15) {
      return 'orange';
    } else {
      return 'green';
    }
  };


  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loading}>Loading...</Text>
      </SafeAreaView>);
  }

  return (
    <SafeAreaView style={styles.container}>

      <Text style={styles.title}>Your Selected Team this week</Text>
      <View style={styles.teaminfo}>
        <Text style={styles.text}>Total Price: {teamData.reduce((acc, player) => acc + player.price, 0)}</Text>
      </View>


      {error && <Text style={styles.error}>{error}</Text>}
      <ScrollView>
       
      </ScrollView>
      <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.bottomButton} onPress={GoBack}>
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
  teaminfo:{
    margin: 12
  },
  text: {
    color: 'white',
    fontSize: 20,
    textAlign: 'left',
  },
  loading: {
    color: 'white',
    fontSize: 35,
    textAlign: 'center',
  },
  title: {
    color: 'white',
    fontSize: 25,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  label: {
    color: '#fe8c19',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
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
  bottomButtons: {
    marginTop: 20,
    alignItems: 'center',
  },
  bottomButton: {
    backgroundColor: '#5e3bf6',
    padding: 10,
    borderWidth: 2,
    borderColor: 'white',
    margin: 20,
  },
});

export default PlayerSelect;
