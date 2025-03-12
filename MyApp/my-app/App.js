import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
//import ArticleList from './ArticleList';
import RootNavigation, { AuthProvider } from './navigation/rootNav';
import { Store } from './redux/store';
import { Provider } from 'react-redux';

export default function App() {
  return (
    <Provider store={Store}>
      <AuthProvider>
        <RootNavigation/>
      </AuthProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
