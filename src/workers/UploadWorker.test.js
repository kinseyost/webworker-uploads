import UploadWorker from './UploadWorker.js';

jest.mock('./upload.worker.js');

afterEach(() => {
  jest.restoreAllMocks();
})

function createInstance(overrides) {
  const onCancelSpy = jest.fn(() => 'onCancel');
  const onProgressSpy = jest.fn(() => 'onProgress');
  const onLoadStartSpy = jest.fn(() => 'onLoadStart');
  const onLoadEndSpy = jest.fn(() => 'onLoadEnd');
  const onErrorSpy = jest.fn(() => 'onError');
  const uploadWorker = new UploadWorker({
    onCancel: onCancelSpy,
    onProgress: onProgressSpy,
    onLoadStart: onLoadStartSpy,
    onLoadEnd: onLoadEndSpy,
    onError: onErrorSpy,
    ...overrides
  });
  return uploadWorker;
}

describe('UploadWorker', () => {
  test('constructor assigns methods for onCancel, onProgress, onLoadStart, onLoadEnd, onError', () => {
    const uploadWorker = createInstance();
    expect(uploadWorker.onCancel()).toBe('onCancel');
    expect(uploadWorker.onProgress()).toBe('onProgress');
    expect(uploadWorker.onLoadStart()).toBe('onLoadStart');
    expect(uploadWorker.onLoadEnd()).toBe('onLoadEnd');
    expect(uploadWorker.onError()).toBe('onError');
  });

  test('constructor sets up upload.worker with default params', () => {
    const handleMessageSpy = jest.fn();
    jest.spyOn(UploadWorker.prototype, 'handleMessage').mockImplementation(handleMessageSpy);
    const uploadWorker = createInstance();
    expect(uploadWorker.worker.onerror()).toBe('onError');
    uploadWorker.worker.onmessage({ data: { cmd: 'hello' } });
    expect(handleMessageSpy).toHaveBeenCalled();
    expect(handleMessageSpy).toHaveBeenCalledWith({ data: { cmd: 'hello' } });
  });

  test('handleMessage should call resulting function for command', () => {
    const loadStartSpy = jest.fn(() => 'I got Loaded');
    const uploadWorker = createInstance({ onLoadStart: loadStartSpy });
    // const message = uploadWorker.onLoadStart();
    // expect(message).toBe('I got Loaded');
    uploadWorker.worker.onmessage({ data: { cmd: 'loadStart' } });
    expect(uploadWorker.onLoadStart).toHaveBeenCalledTimes(1);
    uploadWorker.worker.onmessage({ data: { cmd: 'loadStart' } });
    expect(uploadWorker.onLoadStart).toHaveBeenCalledTimes(2);
  });

  test('handleMessage should call resulting function for command', () => {
    const loadStartSpy = jest.fn();
    const loadCancelledSpy = jest.fn();
    const progressReportSpy = jest.fn();
    const loadEndSpy = jest.fn();

    const uploadWorker = createInstance({
      onLoadStart: loadStartSpy,
      onCancel: loadCancelledSpy,
      onProgress: progressReportSpy,
      onLoadEnd: loadEndSpy,
    });

    uploadWorker.worker.onmessage({ data: { cmd: 'loadStart' } });
    expect(uploadWorker.onLoadStart).toHaveBeenCalled();
    uploadWorker.worker.onmessage({ data: { cmd: 'loadCancelled' } });
    expect(uploadWorker.onCancel).toHaveBeenCalled();
    uploadWorker.worker.onmessage({ data: { cmd: 'progressReport' } });
    expect(uploadWorker.onProgress).toHaveBeenCalled();
    uploadWorker.worker.onmessage({ data: { cmd: 'loadEnd' } });
    expect(uploadWorker.onLoadEnd).toHaveBeenCalled();
  });

  test('handleMessage should throw if passed a command not being handled', () => {
    const uploadWorker = createInstance();
    expect(() => { uploadWorker.worker.onmessage({ data: { cmd: 'error' } }) }).toThrowError('Command `error` not found, possible callbacks are `loadCancelled`, `progressReport`, `loadStart`, `loadEnd`.');
  });

  test('worker should receive message for handling upload', () => {
    const uploadWorker = createInstance();
    const files = ['file1', 'file2'];
    uploadWorker.upload(files);
    expect(uploadWorker.worker.postMessage).toHaveBeenCalledWith({ cmd: 'upload', files });
  });

  test('passing undefined `onError` function calls the instance\'s `logError` method', () => {
    const logErrorSpy = jest.fn();
    jest.spyOn(UploadWorker.prototype, 'logError').mockImplementation(logErrorSpy);
    const uploadWorker = createInstance({ onError: undefined });
    uploadWorker.onError({ error: 'myBigError' })
    expect(logErrorSpy).toHaveBeenCalledWith({ error: 'myBigError' });
  });

  test('logError throws with message', () => {
    const uploadWorker = createInstance({ onError: undefined });
    expect(() => { uploadWorker.onError({
      lineno: 1,
      filename: 'upload.worker.js',
      message: 'Uncaught TypeError: Cannot read property \'doFunction\' of undefined' })
    }).toThrowError(
      'WEB_WORKER_ERROR: Line 1 in upload.worker.js: Uncaught TypeError: Cannot read property \'doFunction\' of undefined'
    );
  });

  test('cancelUpload, worker should receive message for handling cancel for upload', () => {
    const uploadWorker = createInstance();
    uploadWorker.cancelUpload();
    expect(uploadWorker.worker.postMessage).toHaveBeenCalledWith({ cmd: 'cancel' });
  });

});
