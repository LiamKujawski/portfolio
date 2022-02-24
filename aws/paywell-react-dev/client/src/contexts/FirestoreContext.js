// import React, { useContext, useState, useEffect } from "react";
// import firebase from 'firebase';
// // import { useAuth } from "../contexts/AuthContext";

// const FirestoreContext = React.createContext();
// const db = firebase.firestore();


// export function useFirestore() {
//   return useContext(FirestoreContext);
// }

// export function FireStoreProvider({ children }) {
//   // const { currentUser } = useAuth();

//   const [UID, setUID] = useState();
//   const [loading, setLoading] = useState(true);

//   function getCurrentUserUID() {
//     return db.collection("users").doc(currentUser.uid).firestore.df.currentUser.uid;
//   }
//   function getUID() {
//     return UID;
//   }

//   async function getClubReadyEmail() {
//    // Create a reference to the cities collection
// const usersRef = db.collection('users');

// // Create a query against the collection
//     const queryRef = await usersRef.where('uid', '==', getCurrentUserUID()).get()
//     if (queryRef.empty) {
//   console.log('No matching documents.');
//   return;
// }  
// console.log(queryRef.docs[0].data().password);
//     return queryRef.docs[0].data().email;

//   }
//   async function getClubReadyPassword() {
//     // Create a reference to the cities collection
// const usersRef = db.collection('users');

// // Create a query against the collection
//     const queryRef = await usersRef.where('uid', '==', getCurrentUserUID()).get()
//     if (queryRef.empty) {
//   console.log('No matching documents.');
//   return;
// }  

//   console.log(queryRef.docs[0].data().password);
//     return queryRef.docs[0].data().password;

//   }


//   // Becuase of firebase's verification delay we load until useEffect is run
//   // useEffect(() => {
//   //   const unsubscribe = auth.onAuthStateChanged((user) => {
//   //     setCurrentUser(user);
//   //     setLoading(false);
//   //   });

//   //   return unsubscribe;
//   // }, []);

//   // Context
//   const value = {
//     getCurrentUserUID,
//     getClubReadyEmail,
//     getClubReadyPassword,
//     db,
//     getUID
//   };

//   // if not loading then we render children of auth provider
//   return (
//     <FirestoreContext.Provider value={value}>
//       {!loading && children}
//     </FirestoreContext.Provider>
//   );
// }
