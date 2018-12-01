import React, { Component } from 'react';
import firebase from '../firebase';
import YT from 'react-youtube';

import leftChev from '../assets/chevrons-left.svg';
import rightChev from '../assets/chevrons-right.svg';
import minus from '../assets/minus-square.svg';

export default class Player extends Component {
  state = {
    autoPlay: true,
    fbSnap: {},
    currentSongIndex: 0,
    currentPlaylistIndex: 0,
    loadedPlaylistData: false,
    currentSongList: [],
    playlistArr: []
  }

  addVideoToList(urlToAdd) {
    //add song to array in state, and push data to db (only if logged in)
    let oldList = this.state.currentSongList;
    let dbRef = firebase.database().ref('urserID/' + this.state.playlistArr[this.state.currentPlaylistIndex] + '/').push();

    oldList.push(urlToAdd);

    this.setState({ currentSongList: oldList });

    return dbRef.set({
      url: urlToAdd
    });

  }

  nextVideoOnEnd(ev) {
    let oldIndex = this.state.currentSongIndex;
    if (oldIndex === this.state.currentSongList.length - 1) {
      console.log('list done');
    } else {
      this.setState({ currentSongIndex: oldIndex + 1 });
    }
  }

  componentDidMount() {

  }
  render() {
    const { isLoggedIn } = this.props;
    const { loadedPlaylistData, fbSnap, currentPlaylistIndex, currentSongIndex, currentSongList, playlistArr, autoPlay } = this.state;
    let that = this;

    //if data is ready, set vars

    // if logged in, set vars equal to currentSong and Playlist without setting state
    // if no pl or data set prev. then leave blank

    if (isLoggedIn === true) {
      if (loadedPlaylistData === false) {
        firebase.database().ref('/urserID').once('value').then(function (snapshot) {
          let currentPlaylist = Object.entries(snapshot.val())[currentPlaylistIndex][1];
          let songArr = Object.entries(currentPlaylist).map(el => el[1].url);
          let playlistArr = Object.entries(snapshot.val()).map(a => a[0]);

          window.test = snapshot.val();


          that.setState({ fbSnap: snapshot.val(), loadedPlaylistData: true, currentSongList: songArr, playlistArr });
        });

        return <div>Loading...</div>
      } else {
        // let playlistArr = Object.entries(fbSnap).map(a => a[0]);
        // let currentPlaylist = Object.entries(fbSnap)[0][1];
        // let songArr = Object.entries(currentPlaylist).map(el => el[1].url);


        // on click set index to 0
        let playlistElems = playlistArr.map((playlistName, i) => {
          return (
            <li
              key={i}
              onClick={() => this.setState({ currentPlaylistIndex: i, loadedPlaylistData: false, currentSongIndex: 0 })}
              className={currentPlaylistIndex === i ? "active" : ""}
            >
              {playlistName}
            </li>
          )
        })


        let songElems = currentSongList.map((el, i) => {
          return (
            <li
              key={i}
              onClick={() => this.setState({ currentSongIndex: i })}
              className={currentSongIndex === i ? "active" : ""}
            >
              {el}
            </li>
          )
        })

        console.log(currentSongList);

        return (
          <div className="video">
            <div className="videoList">
              <ul>
                {playlistElems}
              </ul>
              <ul>
                {songElems}
              </ul>
              <form
                className="videoInput"
                onSubmit={ev => {
                  let urlToAdd = ev.target.children[0].value;

                  ev.target.children[0].value = '';
                  ev.preventDefault();

                  this.addVideoToList(urlToAdd);
                }}>
                <input type="text" placeholder="song url" />
                <button>Add to list</button>
              </form>
            </div>
            <div className="videoPlayer">
              <div className="videoLast">
                <button
                  className={currentSongIndex === 0 ? "disabled" : ""}
                  onClick={() => currentSongIndex === 0 ? console.log('huh?') : this.setState({ currentSongIndex: currentSongIndex - 1 })}
                >
                  <img src={leftChev} />
                </button>
              </div>
              <YT

                // videoId={videoList.length > 0 ? videoList[currentSongIndex].split('v=')[1] : ""}
                videoId={currentSongList.length > 0 ? currentSongList[currentSongIndex].split('v=')[1] : ""}
                onReady={autoPlay ? ev => { ev.target.playVideo() } : ""}
                onStateChange={autoPlay ? ev => { if (ev.data === 5) ev.target.playVideo() } : ""}
                onEnd={ev => this.nextVideoOnEnd(ev)}
                // fix below: plays next video on error before data is loaded from server
                onError={ev => this.nextVideoOnEnd(ev)}
              />
              <div className="videoNext">
                <button
                  className={currentSongIndex + 1 === currentSongList.length ? "disabled" : ""}
                  onClick={() => currentSongIndex + 1 === currentSongList.length ? null : this.setState({ currentSongIndex: currentSongIndex + 1 })}
                >
                  <img src={rightChev} />
                </button>
              </div>
            </div>
          </div>
        )
      }
      //if not logged in, load default player without values
    } else {
      return (
        <div> default nonLogged player</div>
      )
    }
  }
}