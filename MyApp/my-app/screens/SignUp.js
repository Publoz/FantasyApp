import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Input } from '@rneui/base';
import axios from 'axios';



const SignUp = ({ navigation }, props) => {

  //const auth = getAuth();

  const SignIn = () => {
    navigation.navigate("SignIn");
  }

  function verifyInput() {
    if (value.email === '' || value.password === '' || value.name === '') {
      setValue({
        ...value,
        error: 'All fields are mandatory.'
      })
      return false;
    }
    return true;
  }

  const [value, setValue] = useState({
    name: '',
    email: '',
    password: '',
    error: ''
  })

  async function signUp() {
    if (!verifyInput()) {
      return;
    }

    //try {
    await axios.post(process.env.BACKEND + '/auth/signup', {
      name: value.name,
      email: value.email,
      password: value.password
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }).then(function (response) {
      console.log(response);
    })
      .catch(function (error) {
        setValue({
          ...value,
          error: error.message,
        })
      });
    // } catch (error) {
    //   setValue({
    //     ...value,
    //     error: error.message,
    //   })
    // }
  }

  return (
    <View style={styles.container}>


      <Text style={styles.title}>Sign Up page</Text>

      <TouchableOpacity onPress={SignIn} style={styles.button}>
        <Text style={styles.text}>Sign In Screen</Text>
      </TouchableOpacity>


      {!!value.error && <View style={styles.error}><Text style={styles.error}>{value.error}</Text></View>}

      <Input
        placeholder='Name'
        containerStyle={styles.input}
        inputStyle={styles.text}
        value={value.name}
        onChangeText={(text) => setValue({ ...value, name: text })}
      />

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

      <TouchableOpacity title="Sign up" style={styles.button} onPress={signUp}>
        <Text style={styles.buttonText}>Sign Up!</Text>
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

export default SignUp;