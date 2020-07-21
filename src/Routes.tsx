import React from 'react'
import { Route, Switch } from 'react-router';
import { BrowserRouter, Link } from 'react-router-dom';
import { Game } from './components/Game';

export default function Routes() {
  return (
    <BrowserRouter>
      {/* A <Switch> looks through its children <Route>s and
        renders the first one that matches the current URL. */}
      <Switch>
        <Route path="/game">
          <Game />
        </Route>
        <Route path="/intro">
          <div>Intro</div>
        </Route>
        <Route path="/">
          <Link to="/game">Game</Link>
        </Route>
      </Switch>
    </BrowserRouter>
  );
}
