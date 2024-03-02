import axios from 'axios';
import { Store } from '../redux/store';

const fetchClient = () => {

  const defaultOptions = {
    baseURL: process.env.BACKEND,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  };
  const instance = axios.create(defaultOptions);
  console.log(process.env.BACKEND);
  instance.interceptors.request.use(function (config) {
    var token = Store.getState()
    config.headers.TokenAuth =  token.value;
    return config;
  });

  return instance;

}
export default fetchClient();