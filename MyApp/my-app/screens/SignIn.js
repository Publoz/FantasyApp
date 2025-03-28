import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Input } from '@rneui/base';
import axios from 'axios';
import fetchClient from '../utils/apiCaller';
import { setToken } from '../redux/store';
import { Store } from '../redux/store';
import { useDispatch } from 'react-redux';
import { useAuth } from '../navigation/rootNav';

const SignIn = ({ navigation }, props) => {

  //const auth = getAuth();

  const { setIsAuthenticated } = useAuth();

  const [value, setValue] = useState({
    email: '',
    password: '',
    error: ''
  })

  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  function verifyInput() {
    if (value.email === '' || value.password === '') {
      setValue({
        ...value,
        error: 'All fields are mandatory.'
      })
      return false;
    }
    return true;
  }

  function pause(duration) {
    return new Promise(resolve => setTimeout(resolve, duration));
  }

  async function autoFill() {
    //TODO: remove this
    setValue((prevValue) => ({ ...prevValue, email: 'publoz123@gmail.com' }));
    setValue((prevValue) => ({ ...prevValue, password: 'Tester99' }));
    await pause(500);

  }

  async function signIn() {
    if (!verifyInput()) {
      return;
    }

    setLoading(true);
    setValue({
      ...value,
      error: ''
    })

    try {
      const response = await fetchClient.post('/auth/login', {
        email: value.email,
        password: value.password
      }, {
        validateStatus: function (status) {
          return status >= 200 && status < 500; // Resolve only if the status code is less than 500
        }
      });

      if (!response.data.message || response.data.error || response.status != 200) {
        setValue({
          ...value,
          error: "Username/password wrong",
        })
        console.log('-----')
        console.log(response.data.message);
        console.log(response);
        return;
      } else {
        console.log('-----VALID----');
        console.log(response.data.token);
        dispatch(setToken(response.data.token));
        setIsAuthenticated(true);
        navigation.navigate('SignIn');

      }

    } catch (error) {
      setValue({
        ...value,
        error: error.message,
      })
    } finally {
      setLoading(false);
    }
  }

  const Welcome = () => {
    navigation.navigate("Welcome");
  }

  return (
    <View style={styles.container}>


      <Text style={styles.title}>Sign In page</Text>

      <TouchableOpacity onPress={Welcome} style={styles.button}>
        <Text style={styles.text}>To Welcome Screen</Text>
      </TouchableOpacity>


      {!!value.error && <View style={styles.error}><Text style={styles.error}>{value.error}</Text></View>}

      <Input
        placeholder='Email'
        containerStyle={styles.input}
        inputStyle={styles.text}
        value={value.email}
        onChangeText={(text) => setValue({ ...value, email: text })}

      />

      {/* https://reactnativeelements.com/docs/3.4.2/input */}
      <Input
        placeholder='Password'
        containerStyle={styles.input}
        inputStyle={styles.text}
        value={value.password}
        onChangeText={(text) => setValue({ ...value, password: text })}
        secureTextEntry={true}

      />

      {loading && <ActivityIndicator size="large" color="#fe8c19"/>}

      <TouchableOpacity title="AutoFill" style={styles.button} onPress={autoFill} disabled={loading}>
        <Text style={styles.buttonText}>AutoFill</Text>
      </TouchableOpacity>

      <TouchableOpacity title="Sign In" style={styles.button} onPress={signIn} disabled={loading}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>


    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: '#777777',
    alignItems: 'center',
    justifyContent: 'center',
  },

  button: {
    backgroundColor: '#5e3bf6',
    padding: 10,
    borderWidth: 2,
    borderColor: 'white',
    margin: 20
  },

  input: {
    width: '50%',
    alignItems: 'center',
  },

  buttonText: {
    color: 'white',
    fontSize: 30
  },

  title: {
    color: 'white',
    fontSize: 30,
    textDecorationLine: 'underline'

  },

  text: {
    color: 'white',
    fontSize: 30,

  },

  error: {
    color: 'red',
    backgroundColor: 'black',
    fontSize: 30,
    padding: 5
  }

});

export default SignIn;