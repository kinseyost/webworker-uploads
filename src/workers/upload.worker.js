async function upload(file) {
  console.log(file);
  try {
    const response = await fetch('http://localhost:8081/uploads.json', {
      method: 'POST',
      body: file,
      mode: 'no-cors',
      credentials: 'include',
    });
    console.log(response);
  } catch (e) {
    console.error(e);
  }
}

function process(files) {
  console.log('processing', files.length, 'files');
  const formData = new FormData();
  for (var j = 0; j < files.length; j++) {
    var file = files[j];
    console.log(file);
    console.log(file.name);
    formData.append(`files`, file, file.name);
  }
  upload(formData);
}

self.onmessage = function(e) {
  const files = e.data.files;
  process(files);
}

