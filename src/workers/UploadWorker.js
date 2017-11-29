import Worker from './upload.worker.js';
import autoBind from 'auto-bind';

export default class UploadWorker {
  constructor(callbacks) {
    autoBind(this);
    this.initializeCallbacks(callbacks);
    this.initializeWorker();
  }

  initializeCallbacks = ({
    onCancel,
    onProgress,
    onLoadStart,
    onLoadEnd,
    onError = this.logError,
  }) => {
    this.onCancel = onCancel;
    this.onProgress = onProgress;
    this.onLoadStart = onLoadStart;
    this.onLoadEnd = onLoadEnd;
    this.onError = onError;
  }

  initializeWorker() {
    this.worker = new Worker();
    this.worker.onerror = this.onError;
    this.worker.onmessage = this.handleMessage;
  }

  handleMessage({ data }) {
    const { cmd, ...params } = data;
    const commands = {
      loadCancelled: this.onCancel,
      progressReport: this.onProgress,
      loadStart: this.onLoadStart,
      loadEnd: this.onLoadEnd,
    };
    const callbackToBeExecuted = commands[cmd];

    if (callbackToBeExecuted) {
      callbackToBeExecuted(params);
    } else {
      let possibleCommands = '';
      const commandKeys = Object.keys(commands);
      commandKeys.forEach((key, i) => {
        const isLastKey = i < commandKeys.length - 1;
        possibleCommands += isLastKey ? `\`${key}\`, ` : `\`${key}\`.`;
      });
      throw new Error(`Command \`${cmd}\` not found, possible callbacks are ${possibleCommands}`);
    }
  }

  upload(files) {
    if (files && files.length > 0) {
      this.worker.postMessage({ cmd: 'upload', files });
    } else {
      throw new Error('No Files selected');
    }
  }

  logError(e) {
    throw new Error(`WEB_WORKER_ERROR: Line ${e.lineno} in ${e.filename}: ${e.message}`);
  }

  cancelUpload() {
    this.worker.postMessage({ cmd: 'cancel' });
  }
}
