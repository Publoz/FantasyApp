import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../navigation/rootNav';
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

  const SignOut = () => {
    setIsAuthenticated(false);
  };


  if (!componentReady) {
    // Return loading state or placeholder component
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>HOME Screen </Text>
      <Text style={styles.text}>Welcome /dude/</Text>

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.button} onPress={SignOut}>
          <Text style={styles.text}>Sign out</Text>
        </TouchableOpacity>

        <View style={styles.strict}>
          <Text style={styles.text}>Requires permissions</Text>
        </View>

      </View>
    </View>
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
