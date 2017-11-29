import autoBind from 'auto-bind';

export default class MockUploadWebWorker {
  constructor() {
    autoBind(this);
  };
  postMessage = jest.fn();
}
