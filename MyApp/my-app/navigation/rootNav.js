import React from 'react';
import { useAuth } from '../utils/useAuthentication';
import AuthStack from './authStack';
import MenuStack from './menuStack';

export default function RootNavigation() {
 // const { user } = null;//useAuth();

  return null ? <MenuStack /> : <AuthStack />;
}
