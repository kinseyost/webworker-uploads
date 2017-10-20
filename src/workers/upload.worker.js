import { initializeSocket } from '../utils/socketSetup.js';

const socket = initializeSocket();
socket.on('io', (message) => { console.log(message); })

function upload(blobOrFile) {
  socket.emit('upload', { type: 'STORE_BLOB', blobOrFile });
}

function process(files) {
  debugger;
  console.log('processing', files.length, 'files');
  const totalSize = calculateTotalSize(files);
  console.log('processing', totalSize, 'bytes');
  for (var j = 0; j < files.length; j++) {
    var file = files[j];

    const BYTES_PER_CHUNK = 1024 * 1024;
    // 1MB chunk sizes.
    const SIZE = file.size;
    const totalChunks = Math.ceil(SIZE / BYTES_PER_CHUNK);
    var start = 0;
    var end = BYTES_PER_CHUNK;
    let chunkCount = 1;
    while (start < SIZE) {
      console.log('uploading', file.name, 'chunk', chunkCount, 'of', totalChunks );
      chunkCount ++;
      var chunk = file.slice(start, end);
      upload(chunk);

      start = end;
      end = start + BYTES_PER_CHUNK;
    }
    // p = ( j = files.length - 1) ? true : false;
    self.postMessage(file.name + " Uploaded Succesfully");

  }
}


self.onmessage = function(e) {
  const files = e.data.files;
  const fileArray = [];
  for (var j = 0; j < files.length; j++) {
    fileArray.push(files[j]);
  }
  process(fileArray);
}

function calculateTotalSize(files = []) {
  let size = 0;
  files.forEach(file => { size += file.size });
  return size;
}
