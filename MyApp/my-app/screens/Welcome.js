import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';





const Welcome = ({ navigation }, props) => {

  
  
    const SignIn = () => {
        navigation.navigate("SignIn");
    }

    const SignUp = () => {
        navigation.navigate("SignUp");
    }

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Welcome page</Text>

            <TouchableOpacity onPress={SignIn}>
                <Text style={styles.text}>Sign In</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={SignUp}>
                <Text style={styles.text}>Sign Up</Text>
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
  
    text: {
        color: 'white', 
        fontSize: 30
    },
  
   
  });

export default Welcome;