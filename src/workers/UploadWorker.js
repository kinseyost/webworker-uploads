export default class UploadWorker {
  constructor(callbacks) {
    this.xhr = new XMLHttpRequest();
    this.initializeCallbacks(callbacks);
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

  upload = (files) => {
    if (files && files.length > 0) {
      const formData = this.convertFilesToFormData(files);
      this.sendFiles(formData);
    } else {
      throw new Error('No Files selected');
    }
  }

    sendFiles = (files) => {
      try {
      const uploadUrl = 'http://localhost:8081/uploads.json';
      this.xhr.open('POST', uploadUrl);
      this.addXHRStartHandler();
      this.addXHRProgressHandler();
      this.addXHRFinishHandler();
      this.xhr.send(files);

    } catch (e) {
      throw new Error(e);
    }
  }

  addXHRStartHandler = () => {
    this.xhr.onloadstart = (e) => {
      const { loaded, total } = e;
      if (this.loadStart) {
        this.loadStart( { loaded, total });
      }
    }
  }

  addXHRProgressHandler = () => {
    this.xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        const { loaded, total } = e;
        if (this.onProgress) {
          this.onProgress({ loaded, total });
        }
      }
    }, false);
  }

  addXHRStartHandler = () => {
    this.xhr.onloadstart = function (e) {
      const { loaded, total } = e;
      if (this.onLoadStart) {
        this.onLoadStart({ loaded, total });
      }
    }
  }

  addXHRFinishHandler = () => {
    this.xhr.onloadend = function (e) {
      const { target: {
        response,
        status,
        statusText,
        responseURL,
      } } = e;
      if (status === 0 && this.onCancel) {
        this.onCancel({ response, status, statusText, responseURL});
      } else if (this.onLoadEnd) {
        this.onLoadEnd({ response, status, statusText, responseURL })
      }
    }
  }

  convertFilesToFormData = (files) => {
    const formData = new FormData();
    for (var j = 0; j < files.length; j++) {
      var file = files[j];
      formData.append(`files`, file, file.name);
    }
    return formData;
  }

  logError = (e) => {
    throw new Error(`WEB_WORKER_ERROR: Line ${e.lineno} in ${e.filename}: ${e.message}`);
  }

  cancelUpload = () => {
    this.xhr.abort();
    if (this.onCancel) {
      this.onCancel();
    }
  }
}
