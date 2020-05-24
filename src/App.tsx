import React from 'react';
import './App.css';
import { Game } from './components/Game';
import { StoreProvider } from './store/store';
import { ImagesProvider } from './utils/Images';

function App() {
  return (
    <div className="App">
      <ImagesProvider>
        <StoreProvider>
          <Game
            {...{
              frameRate: 25,
              cityWidth: 800,
              cityHeight: 431,
              difficulty: 3,
            }}
          />
        </StoreProvider>
      </ImagesProvider>
    </div>
  );
}

export default App;
