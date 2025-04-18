import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Input } from '@rneui/base';
import axios from 'axios';
import fetchClient from '../utils/apiCaller';



const SignUp = ({ navigation }, props) => {
  
  const [value, setValue] = useState({
    name: '',
    email: '',
    password: '',
    error: ''
  })

  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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


  async function signUp() {
    setIsLoading(true);
    setIsSuccess(false);
    setValue({
      ...value,
      error: ''
    })

    if (!verifyInput()) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetchClient.post('/auth/signup', {
        name: value.name,
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
          error: "Error: " + response.data.error,
        })
        return;
      } else {
        console.log('-----VALID SIGNUP----');
        setIsSuccess(true);
        console.log(response.data);
      }

    } catch (error) {
      setValue({
        ...value,
        error: error.message,
      })
    } finally {
      setIsLoading(false);
    }
  

    //try {
 
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

      {isSuccess && <View style={styles.successContainer}><Text style={styles.success}>User Created! Check your email and then sign In</Text></View>}

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

      <TouchableOpacity title="Sign up" style={styles.button} onPress={signUp} disabled={isLoading}>
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
    width: '85%',
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
  },
  success: {
    color: '#49bf00',
    backgroundColor: 'black',
    textAlign: 'center',
    fontSize: 30,
    padding: 5,
  },
  successContainer: {
    color: '#49bf00',
    backgroundColor: 'black',
    textAlign: 'center',
    fontSize: 30,
    marginBottom:20,
  }


});

export default SignUp;