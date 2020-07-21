import React from 'react';
import './App.css';
import { StoreProvider } from './store/store';
import { ImagesProvider } from './utils/Images';
import Routes from './Routes';

function App() {
  return (
    <div className="App">
      <ImagesProvider>
        <StoreProvider>
          <Routes />
        </StoreProvider>
      </ImagesProvider>
    </div>
  );
}

export default App;
