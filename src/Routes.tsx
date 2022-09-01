import { Route, Routes } from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import { Game } from './components/Game';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/game" element={<Game />}></Route>
        <Route path="/" element={<Game />}></Route>
      </Routes>
    </BrowserRouter>
  );
}
