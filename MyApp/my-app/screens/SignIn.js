import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Input } from '@rneui/base';



const SignIn = ({ navigation }, props) => {

    //const auth = getAuth();

    const [value, setValue] = useState({
        email: '',
        password: '',
        error: ''
      })

    async function signIn() {
        if (value.email === '' || value.password === '') {
          setValue({
            ...value,
            error: 'Email and password are mandatory.'
          })
          return;
        }
      
        try {
          //await signInWithEmailAndPassword(auth, value.email, value.password);
          navigation.navigate('SignIn');
        } catch (error) {
          setValue({
            ...value,
            error: error.message,
          })
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