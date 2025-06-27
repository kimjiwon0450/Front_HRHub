import { useState } from 'react';
import viteLogo from '/vite.svg';
import './App.css';
import { AuthContextProvider } from './context/UserContext.jsx';
import AppRouter from './router/AppRouter.jsx';

function App() {
  const [count, setCount] = useState(0);

  return (
    <AuthContextProvider>
      <div className='App'>
        <div className='content-wrapper'>
          <AppRouter />
        </div>
      </div>
    </AuthContextProvider>
  );
}

export default App;
