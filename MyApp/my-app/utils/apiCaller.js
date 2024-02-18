import axios from 'axios';
import { store } from '../redux/store';

const fetchClient = () => {

  const defaultOptions = {
    baseURL: process.env.BACKEND,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  };
  const instance = axios.create(defaultOptions);

  instance.interceptors.request.use(function (config) {
    var token = store.getState("token")
    console.log(token);
    config.headers.TokenAuth =  token ? token : '';
    return config;
  });

  return instance;

}
export default fetchClient();