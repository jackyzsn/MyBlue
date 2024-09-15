import React from 'react';
import './global.css';

import MyProvider from './context/myContext';
import './i18n';
import Main from './Main';

const App: React.FC = () => {

  return (
    <MyProvider>
      <Main />
    </MyProvider>
  );
};

export default App;
