import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../navigation/rootNav';
import fetchClient from '../utils/apiCaller';
//import { useAuth } from '../utils/useAuthentication';



const Home = ({ navigation }, props) => {
  const [componentReady, setComponentReady] = useState(false);
  const { setIsAuthenticated } = useAuth();
  //const { user } = useAuth();
  //const auth = getAuth();

  useEffect(() => {
    setComponentReady(true);
  }, []);

  // const signUserOut = (auth) => {
  //   signOut(auth);
  // };


  // const NaviDelete = () => {
  //   navigation.navigate('Delete');
  // };

  async function TestAuth() {
    try {
      const response = await fetchClient.get('/dashboard', {
        validateStatus: function (status) {
          return status >= 200 && status < 500; // Resolve only if the status code is less than 500
        }
      });

      console.log(response.data);

    } catch (error) {
      console.error('There was an error! ', error);
    }

  }

  const SignOut = () => {
    setIsAuthenticated(false);
  };

  const NavigateToTeamSelection = () => {
    navigation.navigate('SelectedTeam');
  };


  if (!componentReady) {
    // Return loading state or placeholder component
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.text}>HOME Screen </Text>
      <Text style={styles.text}>Welcome /dude/</Text>

      <View style={styles.buttons}>

      <TouchableOpacity style={styles.button} onPress={NavigateToTeamSelection}>
          <Text style={styles.text}>My Team this Round</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={TestAuth}>
          <Text style={styles.text}>Test Auth</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={SignOut}>
          <Text style={styles.text}>Sign out</Text>
        </TouchableOpacity>

        <View style={styles.strict}>
          <Text style={styles.text}>Requires permissions</Text>
        </View>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: '#1e78ff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttons: {
    marginTop: 30,
    height: '90%',
  },

  text: {
    color: 'white',
    fontSize: 30,
    textAlign: 'center',
  },

  button: {
    backgroundColor: '#5e3bf6',
    padding: 10,
    borderWidth: 2,
    borderColor: 'white',
    margin: 20,
  },

  strict: {
    backgroundColor: '#fe8c19',
    borderColor: 'white',
    borderWidth: 2,
    padding: 7,
  },
});

export default Home;
