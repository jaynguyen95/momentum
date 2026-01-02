import React from 'react';
import {Text} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {NavigationContainer} from '@react-navigation/native';
import {useAuth} from '../context/AuthContext';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Main Screens
import HabitsScreen from '../screens/main/HabitsScreen';
import StatisticsScreen from '../screens/main/StatisticsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import CreateHabitScreen from '../screens/main/CreateHabitScreen';
import HabitDetailScreen from '../screens/main/HabitDetailScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#667eea',
        tabBarInactiveTintColor: '#999',
        headerShown: false,
      }}>
      <Tab.Screen
        name="HabitsTab"
        component={HabitsScreen}
        options={{
          tabBarLabel: 'Habits',
          tabBarIcon: () => <Text style={{fontSize: 24}}>📋</Text>,
        }}
      />
      <Tab.Screen
        name="StatisticsTab"
        component={StatisticsScreen}
        options={{
          tabBarLabel: 'Stats',
          tabBarIcon: () => <Text style={{fontSize: 24}}>📊</Text>,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: () => <Text style={{fontSize: 24}}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const {user, loading} = useAuth();

  if (loading) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!user ? (
          <>
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen 
              name="Register" 
              component={RegisterScreen}
              options={{headerShown: false}}
            />
          </>
        ) : (
          <>
            <Stack.Screen 
              name="Main" 
              component={MainTabs}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="CreateHabit"
              component={CreateHabitScreen}
              options={{
                headerShown: true,
                title: 'Create Habit',
                headerStyle: {backgroundColor: '#667eea'},
                headerTintColor: 'white',
                headerTitleStyle: {fontWeight: '600'},
              }}
            />
            <Stack.Screen
              name="HabitDetail"
              component={HabitDetailScreen}
              options={{
                headerShown: true,
                title: 'Habit Details',
                headerStyle: {backgroundColor: '#667eea'},
                headerTintColor: 'white',
                headerTitleStyle: {fontWeight: '600'},
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;