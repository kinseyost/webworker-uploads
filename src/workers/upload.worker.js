/* eslint-disable no-restricted-globals*/


let xhr = new XMLHttpRequest();

self.onmessage = function ({ data }) {
  const { cmd, ...params } = data;
  const commands = {
    upload: uploadFiles,
    cancel: cancelUpload,
  }
  if (commands[cmd]) {
    commands[cmd](params);
  } else {
    throwCommandError(cmd, commands);
  }
}

function uploadFiles({ files }) {
  const formData = convertFilesToFormData(files);
  sendFiles(formData);
}

function convertFilesToFormData(files) {
  const formData = new FormData();
  for (var j = 0; j < files.length; j++) {
    var file = files[j];
    formData.append(`files`, file, file.name);
  }
  return formData;
}

function sendFiles(files) {
  try {
    const uploadUrl = 'http://localhost:8081/uploads.json';
    xhr.open('POST', uploadUrl);
    addXHRStartHandler();
    addXHRProgressHandler();
    addXHRFinishHandler();
    xhr.send(files);

  } catch (e) {
    throw new Error(e);
  }
}

function addXHRProgressHandler() {
  xhr.upload.addEventListener("progress", function (e) {
    if (e.lengthComputable) {
      const { loaded, total } = e;
      self.postMessage({ cmd: 'progressReport', loaded, total });
    }
  }, false);
}

function addXHRStartHandler() {
  xhr.onloadstart = function (e) {
    const { loaded, total } = e;

    self.postMessage({ cmd: 'loadStart', loaded, total });
  }
}

function addXHRFinishHandler() {
  xhr.onloadend = function (e) {
    const { target: {
      response,
      status,
      statusText,
      responseURL,
    } } = e;
    if (status === 0) {
      self.postMessage({ cmd: 'loadCancelled' });
    } else {
      self.postMessage({
        cmd: 'loadEnd',
        response,
        status,
        statusText,
        responseURL,
      });
    }
  }
}

function cancelUpload() {
  xhr.abort();
}

function throwCommandError(cmd, commands) {
  let possibleCommands = '';
  const commandKeys = Object.keys(commands);
  commandKeys.forEach((key, i) => {
    const isLastKey = i < commandKeys.length - 1;
    possibleCommands += isLastKey ? `\`${key}\`, ` : `\`${key}\`.`;
  });
  throw new Error(`Command \`${cmd}\` not found, possible callbacks are ${possibleCommands}`);
}

export default self;
