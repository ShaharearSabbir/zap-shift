import React, { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { auth } from "../../Firebase/Firebase.config";

const google = new GoogleAuthProvider();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const createUser = (email, password) => {
    setLoading(true);
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const signinUser = (email, password) => {
    setLoading(true);
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logOut = () => {
    setLoading(true);
    return signOut(auth);
  };

  const googleLogin = () => {
    setLoading(true);
    return signInWithPopup(auth, google);
  };

  useEffect(() => {
    const unSubs = onAuthStateChanged(auth, (currentUser) => {
      console.log("User on onAuthStateChanged:", currentUser);
      setUser(currentUser);
      setLoading(false);
    });
    return () => unSubs();
  }, []);

  const contextData = {
    name: "Shaharear",
    createUser,
    signinUser,
    googleLogin,
    user,
    logOut,
    loading,
  };
  return <AuthContext value={contextData}>{children}</AuthContext>;
};

export default AuthProvider;
