import React, { useEffect } from "react";
//import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { useState } from "react";

const auth = getAuth();

export function useAuth() {
  const [user, setUser] = useState(null);

  useEffect(() => {
   /* const unsubscribeFromAuthStateChanged = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        setUser(user);
      } else {
        // User is signed out
        setUser(undefined);
      }
    });

    return unsubscribeFromAuthStateChanged;*/
    return null;
  }, []);

  return {
    user,
  };
}
