import React from 'react';
import { StatusBar } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

function App(): React.JSX.Element {
  return (
    <AuthProvider>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />
      <AppNavigator />
    </AuthProvider>
  );
}

export default App;
