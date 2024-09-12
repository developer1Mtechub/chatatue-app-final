import React, { useEffect } from 'react'
import { LogBox, SafeAreaView, StatusBar, StyleSheet, View } from 'react-native'
import { Provider } from 'react-redux'
import { persistor, store } from './src/redux/store'
import { PersistGate } from 'redux-persist/integration/react';
import Root from './src/navigations/Root';
import { AlertProvider } from './src/providers/AlertContext';
import DynamicAlert from './src/components/DynamicAlert';
import theme from './src/styles/theme';
import { StripeProvider } from '@stripe/stripe-react-native';

export default function App() {
  LogBox.ignoreAllLogs();
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AlertProvider>
          <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor={theme.colors.primary} />
            <StripeProvider publishableKey={"pk_test_51Ml3wJGui44lwdb4K6apO4rnFrF2ckySwM1TfDcj0lVdSekGOVGrB1uHNlmaO7wZPxwHfRZani73KlHQKOiX4JmK00E0l7opJO"}>
              <Root />
            </StripeProvider>
            <DynamicAlert />
          </SafeAreaView>
        </AlertProvider>
      </PersistGate>

    </Provider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background
  },
})