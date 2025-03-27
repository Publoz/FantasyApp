import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import Welcome from '../screens/Welcome';
import SignIn from '../screens/SignIn';
import Home from '../screens/Home';
import SelectedTeam from '../screens/SelectedTeam';
//import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

//import { Root } from 'react-native-popup-confirm-toast';

const Stack = createStackNavigator();
//const Tab = createBottomTabNavigator();

export default function MenuStack() {
    return ( 
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    cardStyle: {
                        backgroundColor: '#0e1529'
                    },
                    headerShown: false
                }}>
                <Stack.Screen name="Home"
                    component={Home}
                    options={{
                        tabBarShowLabel: false,
                        tabBarIcon: ({ focused }) => (
                            <Text>Chur</Text>
                        ),
                    }} />
                    <Stack.Screen name="SelectedTeam" component={SelectedTeam} />

              
                {/* <Stack.Screen name="Info"
                    component={Info} />
                <Stack.Screen name="MatchInfo"
                    component={MatchInfo} />
                <Stack.Screen name="Delete"
                    component={Delete} />
                <Stack.Screen name="Stage"
                    component={Stage} />
                <Stack.Screen name="Setup"
                    component={Setup} />
                <Stack.Screen name="Create"
                    component={Create} />
                <Stack.Screen name="Stats"
                    component={Stats} />
                <Stack.Screen name="StatsComp"
                    component={StatsComp} />
                <Stack.Screen name="Games"
                    component={Games} />
                     <Stack.Screen name="Summary"
                    component={Summary} /> */}


            </Stack.Navigator>
        </NavigationContainer>
    );
}
