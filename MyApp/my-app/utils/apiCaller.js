import axios from 'axios';
import { Store } from '../redux/store';

const fetchClient = () => {
  const defaultOptions = {
    baseURL: process.env.REACT_APP_BACKEND,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  const instance = axios.create(defaultOptions);
  console.log(process.env.REACT_APP_BACKEND);
  instance.interceptors.request.use(function (config) {
    
    var token = Store.getState();
    config.headers.TokenAuth =  token.token.value;
    return config;
  });

  return instance;

}
export default fetchClient();