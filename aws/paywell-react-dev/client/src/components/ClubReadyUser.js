import React from 'react';
import firebase from 'firebase';
// import firestore from "./firestore";
class User extends React.Component {
    constructor() {
    super();
    this.state = {
     email: "",
     password: ""
    };
    }
    updateInput = e => {
      this.setState({
        [e.target.name]: e.target.value
      });
    }
  addUser = e => {
      console.log(this.state.email, " ", this.state.password)
      e.preventDefault();
      const db = firebase.firestore();
      db.settings({
        timestampsInSnapshots: true
      });

      const userRef = db.collection("users").add({
        email: this.state.email,
        password: this.state.password
      });  
      this.setState({
        password: "",
        email: ""
      });
    };
  render() {
    return (
        <form onSubmit={this.addUser}>
          <input
            type="password"
          name="password"
          onChange={this.updateInput}
          value={this.state.password}
            placeholder="Club Ready Password"
          />
          <input
            type="text"
          name="email"
          onChange={this.updateInput}
          value={this.state.email}
            placeholder="Club Ready Email"
          />
          <button type="submit">Submit</button>
        </form>
        );
      }
   }
export default User;