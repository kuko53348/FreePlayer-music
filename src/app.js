import { runApp, initRouter, subscribe, getCurrentPath, useState } from 'flet-box';
import { PlayerScreen } from './screens/PlayerScreen.js';
import { SettingsScreen } from './screens/SettingsScreen.js';

const routes = {
  '/': PlayerScreen,
  '/settings': SettingsScreen,
};

initRouter(routes);

let setRoutePath = null;
subscribe(() => {
  if (typeof setRoutePath === 'function') setRoutePath(getCurrentPath());
});

const App = () => {
  const [path, setPath] = useState('app:route', getCurrentPath());
  setRoutePath = setPath;
  const current = path.valueOf();
  const Screen = routes[current] || routes['/'];
  return Screen();
};

runApp(App, 'root');
