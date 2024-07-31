import { StyleSheet } from 'react-native';

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#000',
    padding: 10,
  },
  buttonText: {
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#000',
    width: '80%',
    padding: 10,
    marginBottom: 10,
  },
});