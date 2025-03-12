import { Store } from '../redux/store';

//TODO: use jwt-decode library to add expiry to the token
export default function hasAuth() {
    const token = Store.getState().value;
    if (token) {
      return true;
    }

    return false;

}
