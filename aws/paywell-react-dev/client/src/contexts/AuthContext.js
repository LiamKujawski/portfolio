import React, { useContext, useState, useEffect } from "react";
import { auth } from "../firebase";
import firebase from 'firebase';


const AuthContext = React.createContext();
const db = firebase.firestore();


export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState();
    const [currentClubReadyLogin, setCurrentClubReadyLogin] = useState({email: "email", password: "password"});

  const [loading, setLoading] = useState(true);

  // If we want to change from firebase we change login/signup to use server instead
  function signup(email, password) {
    return auth.createUserWithEmailAndPassword(email, password);
  }

  function login(email, password) {
    return auth.signInWithEmailAndPassword(email, password);
  }

  function logout() {
    return auth.signOut();
  }

  function resetPassword(email) {
    return auth.sendPasswordResetEmail(email);
  }

  function updateEmail(email) {
    return currentUser.updateEmail(email);
  }

  function updatePassword(password) {
    return currentUser.updatePassword(password);
  }

  function getCurrentUserUID() {
    return db.collection("users").doc(currentUser.uid).firestore.df.currentUser.uid;
  }


  async function getClubReadyLogins() {
    // Create a reference to the cities collection
    const usersRef = db.collection('users');

    // Create a query against the collection
    const queryRef = await usersRef.where('uid', '==', getCurrentUserUID()).get()
    if (queryRef.empty) {
      console.log('No matching documents.');
      return false;
    }  
    let logins = [];
    queryRef.forEach(doc => {
      console.log(doc.id, '=>', doc.data());
      logins.push(doc.data())
    });
    return logins
  }





  // Becuase of firebase's verification delay we load until useEffect is run
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Context
  const value = {
    currentUser,
    login,
    signup,
    logout,
    resetPassword,
    updateEmail,
    updatePassword,
    getCurrentUserUID,
    getClubReadyLogins,
    currentClubReadyLogin,
    setCurrentClubReadyLogin,
    db,
  };

  // if not loading then we render children of auth provider
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}

    </AuthContext.Provider>
  );
}
