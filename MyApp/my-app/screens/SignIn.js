import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Input } from '@rneui/base';
import axios from 'axios';



const SignIn = ({ navigation }, props) => {

  //const auth = getAuth();

  const [value, setValue] = useState({
    email: '',
    password: '',
    error: ''
  })

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

  async function signIn() {
    if (!verifyInput()) {
      return;
    }

    await axios.post(process.env.BACKEND + '/auth/login', {
      email: value.email,
      password: value.password
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        "Accept": "*/*, application/json, text/plain"
      }
    }).then(function (response) {
      if(response.status = 404){
        setValue({
          ...value,
          error: "Username/password wrong",
        })
        console.log('-----')
        console.log(response.data.message);
        console.log(response);
        return;
      } else {
        axios.get(process.env.BACKEND + '/dashboard').then(response => {
          console.log(response.message);
      })
      .catch(error => {
          console.log(error);
      });

      }
    }).catch(function (error) {
      setValue({
        ...value,
        error: error.message,
      })
    });
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


      <TouchableOpacity title="Sign up" style={styles.button} onPress={signIn}>
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