import React, { Component } from 'react';
import UploadWorker from './workers/UploadWorker.js';

export default class Uploads extends Component {
  constructor(props) {
    super(props);
    this.state = { fileInfo: [] };
    this.uploadWorker = new UploadWorker({
      onProgress: this.setPercentageLoaded,
      onLoadStart: this.resetProgress,
      onLoadEnd: this.onLoadEnd,
      onCancel: this.onCancel,
    });
  }

  handleUpload = (e) => {
    const { files } = e.target;
    const fileInfo = this.convertFilesToArray(files);
    this.setState({ fileInfo, files });
  }

  convertFilesToArray = (files) => {
    const filesLength = files.length;
    const fileInfo = [];
    for (let i = 0; i < filesLength; i++) {
      fileInfo.push(files[i]);
    }
    return fileInfo;
  }

  uploadFiles = (evt) => {
    evt.stopPropagation();
    evt.preventDefault();
    const { files } = this.state;
    if (files && files.length) {
      this.uploadWorker.upload(files);
    } else {
      this.setState({ serverResponse: 'No Files Selected' });
    }
  }

  onLoadEnd = ({ response, status }) => {
    this.setState({ serverResponse: response });
  }

  resetProgress = () => {
    this.setState({ max: 0, value: 0, serverResponse: undefined });
  }

  setPercentageLoaded = ({ total, loaded }) => {
    this.setState({ max: total, value: loaded });
  }

  handleCancel = () => {
    this.uploadWorker.cancelUpload();
    this.resetProgress();
  }

  onCancel = () => {
    this.setState({ serverResponse: 'Cancelled' });
  }

  render() {
    const { fileInfo, value = 0, max = 0, serverResponse } = this.state;
    const Files = fileInfo.map(file => (
      <div key={ file.name }>
        <span> { file.name } </span>
      </div>
    ));
    return (
      <div>
        <input
          multiple
          type='file'
          onChange={this.handleUpload}
          placeholder='Select Files to upload' />
        { Files }
        <button onClick={this.uploadFiles}> Upload </button>
        <progress value={ value } max={ max }/>
        <button onClick={ this.handleCancel }> Cancel </button>
        { serverResponse  && <span> { `${serverResponse}` } </span> }
      </div>

    );
  }
}
