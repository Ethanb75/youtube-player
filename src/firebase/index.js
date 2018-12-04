import * as firebase from 'firebase';
// var firebase = require('firebase/app');

var config = {
  apiKey: "AIzaSyDgt3sJqy9kcZKtAcpt9f8EBmgk2COeoXI",
  authDomain: "player-996a3.firebaseapp.com",
  databaseURL: "https://player-996a3.firebaseio.com",
  projectId: "player-996a3",
  storageBucket: "player-996a3.appspot.com",
  messagingSenderId: "528255278767"
};

firebase.initializeApp(config);

export default firebase;