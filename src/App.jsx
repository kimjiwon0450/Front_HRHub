import { useState } from 'react';
import viteLogo from '/vite.svg';
import './App.css';
import { UserContextProvider } from './context/UserContext.jsx';
import AppRouter from './router/AppRouter.jsx';
import MainLayout from './components/MainLayout.jsx';

function App() {
  const [count, setCount] = useState(0);

  return (
    <UserContextProvider>
      <AppRouter />
    </UserContextProvider>
  );
}

export default App;
