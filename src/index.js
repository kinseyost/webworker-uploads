import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Uploads from './Uploads';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<Uploads />, document.getElementById('root'));
registerServiceWorker();
