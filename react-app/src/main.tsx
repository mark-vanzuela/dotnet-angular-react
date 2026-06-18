import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import App from './App.tsx';
import { store } from './app/store.ts';
import './index.css';

// main.tsx is the entry point. We wrap <App /> in two providers:
//   - <Provider store={store}>  makes the Redux store available to every
//     component via the useAppSelector/useAppDispatch hooks.
//   - <BrowserRouter>           enables client-side routing (the URL bar drives
//     which page renders, without full page reloads).
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>
);
