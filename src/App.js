import React, { Component } from 'react';
import Worker from './workers/upload.worker.js';

export default class Uploads extends Component {
  state = { fileInfo: [] };
  handleUpload = (e) => {
    const { files } = e.target;
    const filesLength = files.length;
    const fileInfo = [];
    for (let i = 0; i < filesLength; i++) {
      fileInfo.push(files[i]);
    }
    this.setState({ fileInfo, files });
  }

  uploadFiles = (evt) => {
    evt.stopPropagation();
    evt.preventDefault();
    const { files } = this.state;
    // Send a chunk from the client over websockets...
    const worker = new Worker();
    worker.onmessage = function (e) {
      console.log(e.data);
    }
    worker.onerror = werror;
    worker.postMessage({ files });

  }

  render() {
    const { fileInfo } = this.state;
    const Files = fileInfo.map(file => (
      <div key={file.name}>
        <span> {file.name} </span>
      </div>
    ));
    return (
      <div>
        <input
          multiple
          type='file'
          onChange={this.handleUpload}
          placeholder='Select Files to upload' />
        {Files}
        <button onClick={this.uploadFiles}> Upload </button>
      </div>

    );
  }
}


function werror(e) {
  console.log('ERROR: Line ', e.lineno, ' in ', e.filename, ': ', e.message);
}
