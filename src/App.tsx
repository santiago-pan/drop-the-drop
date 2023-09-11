import React from 'react';
import './App.css';
import { ImagesProvider } from './utils/Images';
import { Game } from './components/Game';

function App() {
  return (
    <div className="App">
      <ImagesProvider>
          <Game />
      </ImagesProvider>
    </div>
  );
}

export default App;
