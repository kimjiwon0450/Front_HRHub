import React, { useContext } from 'react';
import Home from '../components/Home';
import { Route, Routes } from 'react-router-dom';
import PrivateRouter from './PrivateRouter';
import AuthContext from '../context/UserContext';

const AppRouter = () => {
  const { userRole } = useContext(AuthContext); // private 라우터를 이용하기 위해 추가(하준)
  const KAKAO_REDIRECT_URI_PATH = new URL(
    import.meta.env.VITE_KAKAO_REDIRECT_URI,
  ).pathname;

  return (
    <Routes>
      <Route path='/' element={<Home />} />
    </Routes>
  );
};

export default AppRouter;
