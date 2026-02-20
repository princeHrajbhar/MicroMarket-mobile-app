import React from 'react';
import {
  NavigationContainer,
  DefaultTheme,
  Theme
} from '@react-navigation/native';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

import SplashScreen from '../screens/SplashScreen';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import AdminNavigator from './AdminNavigator';
import ProductDetailScreen from '../screens/ProductDetailScreen';

import { RootStackParamList } from '../types';


const Stack = createNativeStackNavigator<RootStackParamList>();


export default function AppNavigator() {

  const { isLoading, isAuthenticated, role } = useAuth();

  const { colors, isDark } = useTheme();


  if (isLoading) {

    return <SplashScreen />;

  }


  // ✅ FIXED THEME
  const navigationTheme: Theme = {

    ...DefaultTheme,

    dark: isDark,

    colors: {

      ...DefaultTheme.colors,

      primary: colors.primary,

      background: colors.background,

      card: colors.surface,

      text: colors.text,

      border: colors.border,

      notification: colors.primary,

    },

  };


  return (

    <NavigationContainer theme={navigationTheme}>

      <Stack.Navigator screenOptions={{ headerShown: false }}>

        {!isAuthenticated ? (

          <Stack.Screen name="Auth" component={AuthNavigator} />

        ) : role === 'admin' ? (

          <>

            <Stack.Screen name="AdminStack" component={AdminNavigator} />

            <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />

          </>

        ) : (

          <>

            <Stack.Screen name="Main" component={MainNavigator} />

            <Stack.Screen

              name="ProductDetail"

              component={ProductDetailScreen}

              options={{ animation: 'slide_from_right' }}

            />

          </>

        )}

      </Stack.Navigator>

    </NavigationContainer>

  );

}
