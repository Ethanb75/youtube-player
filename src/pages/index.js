import React, { Component } from 'react'
import { Link } from 'gatsby'
import firebase from '../firebase';
import 'firebase/auth';

import Layout from '../components/layout'
import Player from '../components/player';
// import Image from '../components/image'
import '../assets/main.css';


export default class IndexPage extends Component {
  state = {
    isLoggedIn: false,
    isLoginModalOpen: false,
    fbUser: {}
  }

  registerUser(email, password) {
    let that = this;
    firebase.auth().createUserWithEmailAndPassword(email, password).then(result => {
      // that.setState({ isLoggedIn: true });
      that.setState({ fbUser: result.user, isLoginModalOpen: false, isLoggedIn: true });
    }).catch(function (error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      console.log('error: ', error);
      that.displayError(errorMessage);
    });
  }

  logInWithGoogle() {
    let provider = new firebase.auth.GoogleAuthProvider();
    let that = this;
    firebase.auth().signInWithPopup(provider).then(function (result) {
      // This gives you a Google Access Token. You can use it to access the Google API.
      var token = result.credential.accessToken;
      // The signed-in user info.
      var user = result.user;

      that.setState({ fbUser: user, isLoginModalOpen: false, isLoggedIn: true });
      // ...
    }).catch(function (error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;

      that.displayError(errorMessage)
    });
  }

  logIn(email, password) {
    let that = this;

    firebase.auth().signInWithEmailAndPassword(email, password).then(function (result) {
      that.setState({ fbUser: result.user, isLoginModalOpen: false, isLoggedIn: true });
    }).catch(function (error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // ...
      console.log("Error: ", error);
      that.displayError(errorMessage);
    });
  }

  logOut() {
    let that = this;

    firebase.auth().signOut().then(function () {
      // Sign-out successful.
      that.setState({ isLoggedIn: false });
    }).catch(function (err) {
      // An error happened.
      console.log(err)
    });
  }

  componentDidMount() {
    let that = this;
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        // User is signed in.
        that.setState({ isLoggedIn: true, fbUser: user })
      } else {
        // No user is signed in.
        that.setState({ isLoggedIn: false })
      }
    });
  }
  render() {

    const { isLoginModalOpen, fbUser, isLoggedIn } = this.state;

    return (
      <Layout>
        {/* login modal below */}
        <div className={isLoginModalOpen ? "loginWrap open" : "loginWrap"}>
          <div>
            <h3>Login</h3>
            <div className="login__auth">
              <button onClick={() => this.logInWithGoogle()}>login with Google</button>
            </div>
            <div className="login__form">
              <form onSubmit={(event, data) => {
                event.preventDefault();

                let email = event.target.children[0].value;
                let password = event.target.children[1].value;

                return this.logIn(email, password);
              }}>
                <input type="email" placeholder="account email" />
                <input type="password" placeholder="password" />
                <input type="submit" value="login" />
              </form>
            </div>
            <span>Or</span>
            <div className="login__reg">
              <h3>Register</h3>
              <form onSubmit={event => {
                event.preventDefault();

                let email = event.target.children[0].value;
                let password = event.target.children[1].value;

                return this.registerUser(email, password);
              }}>
                <input type="email" placeholder="account email" />
                <input type="password" placeholder="password" />
                <input type="submit" value="Register" />
              </form>
            </div>
            <div className="login__err">

            </div>
          </div>

          <button className="loginWrap__close" onClick={() => this.setState({ isLoginModalOpen: false })}>X</button>
        </div>{/*END LOGIN MODAL*/}

        {
          isLoggedIn ?
            <div className="loginBtn">
              <div>{fbUser.email || fbUser.email}</div>
              <button onClick={() => this.logOut()}>Logout</button>
            </div>
            :
            <div className="loginBtn">
              <button onClick={() => this.setState({ isLoginModalOpen: true })}>Login or Register</button>
            </div>
        }

        <Player isLoggedIn={isLoggedIn} />

      </Layout>
    )
  }
}
