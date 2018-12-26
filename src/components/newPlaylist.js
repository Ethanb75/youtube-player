import React, { Component } from 'react';

export default class NewPlaylist extends Component {
  state = {
    playlistFormShowing: false
  }
  render() {
    return (
      <li
        // on click, should toggle for new pl
        // onClick={() => this.props.addNewPlaylist('new list')}
        onClick={() => {
          this.setState({ playlistFormShowing: true })
          alert('no new playlists rn')
        }}
      >
        <span>add playlist (+)</span>
      </li>
    )
  }
}