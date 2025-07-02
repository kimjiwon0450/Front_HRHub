import React, { useContext } from 'react';
import Home from '../components/Home';
import { Route, Routes } from 'react-router-dom';
import PrivateRouter from './PrivateRouter';
import AuthContext from '../context/UserContext';
import Login from '../components/Login';
import MainLayout from '../components/MainLayout';
import Dashboard from '../pages/dashboard/Dashboard';
import NoticeBoardList from '../pages/NoticeBoard/NoticeBoardList';
import NoticeBoardWrite from '../pages/NoticeBoard/NoticeBoardWrite';
import NoticeBoardDetail from '../pages/NoticeBoard/NoticeBoardDetail';

const AppRouter = () => {
  const { userRole } = useContext(AuthContext); // private 라우터를 이용하기 위해 추가(하준)

  return (
    <Routes>
      <Route path='/' element={<Login />} />
      <Route element={<MainLayout />}>
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/hr' element={<></>} />
        <Route path='/payroll' element={<></>} />
        <Route path='/approval' element={<></>} />
        <Route path='/schedule' element={<></>} />
        <Route path='/attendance' element={<></>} />
        <Route path='/noticeboard' element={<NoticeBoardList />} />
        <Route path='/noticeboard/write' element={<NoticeBoardWrite />} />
        <Route path='/noticeboard/:id' element={<NoticeBoardDetail />} />
        <Route path='/mail' element={<></>} />
        <Route path='/board' element={<></>} />
        <Route path='/contacts' element={<></>} />
      </Route>
    </Routes>
  );
};

export default AppRouter;
