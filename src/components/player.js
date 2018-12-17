import React, { Component } from 'react';
import firebase from '../firebase';
import YT from 'react-youtube';

import leftChev from '../assets/chevrons-left.svg';
import rightChev from '../assets/chevrons-right.svg';
import minus from '../assets/minus-square.svg';

const Youtube = require('simple-youtube-api');
console.log(`yt api key: ${process.env.YT_API_KEY}`);
const youtubeData = new Youtube(process.env.YT_API_KEY);
// console.log(`yt api key: ${process.env.YT_API_KEY}`);


// window.youtube = youtubeData;

// youtubeData.getVideo('blah')
//   .then(video => {
//     // window.videoInfo = video;
//     console.log(`The video's title is ${video.title}`);
//   }).catch(console.log)

// replace default playlist with new playlist if changed
export default class Player extends Component {
  state = {
    autoPlay: true,
    fbSnap: {},
    currentSongIndex: 0,
    currentPlaylistIndex: 0,
    loadedPlaylistData: false,
    currentSongList: [],
    playlistArr: [
      "default playlist"
    ]
  }

  // addNewPlaylist(playlistName) {
  //   let that = this;
  //   firebase.database().ref(that.props.user.uid).set({
  //     [`${playlistName}`]: "no data"
  //   });
  // }

  removeSongFromList(index) {
    let { playlistArr, currentPlaylistIndex, fbSnap, currentSongList } = this.state;
    let that = this;
    let uidArr = Object.entries(fbSnap)[0][1];
    let removeRef = '/' + this.props.user.uid + '/' + playlistArr[currentPlaylistIndex] + '/' + Object.entries(uidArr)[index][0] + '/';
    // add the current playlist + the current song uid from index and fbsnap

    firebase.database().ref(removeRef).remove().then(() => {
      that.setState({ currentSongList: currentSongList.filter((el, i) => i !== index) })
    })
  }

  addVideoToList(urlToAdd) {
    //add song to array in state, and push data to db (only if logged in)
    let oldList = this.state.currentSongList;
    let dbRef = firebase.database().ref('/' + this.props.user.uid + '/' + this.state.playlistArr[this.state.currentPlaylistIndex] + '/').push();
    let that = this;

    youtubeData.getVideo(urlToAdd)
      .then(video => {
        let newSongObj = {
          url: urlToAdd,
          title: video.title
        };

        oldList.push(newSongObj);

        that.setState({ currentSongList: oldList });

        return dbRef.set(newSongObj);
      }).catch(console.log)
  }

  nextVideoOnEnd(ev) {
    let oldIndex = this.state.currentSongIndex;
    if (oldIndex === this.state.currentSongList.length - 1) {
      console.log('list done');
    } else {
      this.setState({ currentSongIndex: oldIndex + 1 });
    }
  }

  componentDidUpdate() {

    if (this.props.isLoggedIn === false && this.state.loadedPlaylistData === true) {
      console.log('setting loaded playlist to false')
      this.setState({ loadedPlaylistData: false, currentSongList: [], playlistArr: ["default playlist"] })
    }
    window.test = this.state;
  }

  componentDidMount() {

  }
  render() {
    const { isLoggedIn, user } = this.props;
    const { loadedPlaylistData, fbSnap, currentPlaylistIndex, currentSongIndex, currentSongList, playlistArr, autoPlay } = this.state;
    let that = this;


    //if data is ready, set vars

    // if logged in, set vars equal to currentSong and Playlist without setting state
    // if no pl or data set prev. then leave blank

    if (isLoggedIn === true) {
      if (loadedPlaylistData === false) {
        firebase.database().ref('/' + user.uid).once('value').then(function (snapshot) {
          if (snapshot.val() === null) {
            // user hasn't entered any data
            that.setState({ loadedPlaylistData: true })
          } else {
            //TODO: make a check for a playlist with no songs
            let currentPlaylist = Object.entries(snapshot.val())[currentPlaylistIndex][1];
            let songArr = Object.entries(currentPlaylist).map(el => { return { url: el[1].url, title: el[1].title } })
            let playlistArr = Object.entries(snapshot.val()).map(a => a[0]);

            that.setState({ fbSnap: snapshot.val(), loadedPlaylistData: true, currentSongList: songArr, playlistArr });
          }
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
              <span>{playlistName}</span>
            </li>
          )
        })


        let songElems = currentSongList.map((el, i) => {
          return (
            <li
              key={i}
              className={currentSongIndex === i ? "active" : ""}
            >
              <span onClick={() => this.setState({ currentSongIndex: i })}>{el.title}</span>
              <button onClick={() => this.removeSongFromList(i)}>
                <img src={minus} />
              </button>
            </li>
          )
        })

        return (
          <div className="video">
            <div className="videoList">
              <ul className="playlists">
                {playlistElems}
                <li
                  onClick={console.log('new list')}
                >
                  <span>add playlist (+)</span>
                </li>
              </ul>
              <ul className="songList">
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
                videoId={currentSongList.length > 0 ? currentSongList[currentSongIndex].url.split('v=')[1] : ""}
                onReady={autoPlay ? ev => { ev.target.playVideo() } : ""}
                onStateChange={autoPlay ? ev => { if (ev.data === 5) ev.target.playVideo() } : ""}
                onEnd={ev => this.nextVideoOnEnd(ev)}
                // fix below: plays next video on error before data is loaded from server
                onError={ev => {
                  // this.nextVideoOnEnd(ev);
                  console.log('err!');
                }}
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