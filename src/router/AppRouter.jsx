import React, { useContext } from 'react';
import Home from '../components/Home';
import { Route, Routes } from 'react-router-dom';
import PrivateRouter from './PrivateRouter';
import { UserContext } from '../context/UserContext';
import Login from '../components/Login';
import MainLayout from '../components/MainLayout';
import HRPage from '../pages/hr/HRPage';
import EmployeeDetail from '../pages/hr/EmployeeDetail';
import EmployeeRegister from '../pages/hr/EmployeeRegister';
import EmployeeEdit from '../pages/hr/EmployeeEdit';
import EmployeeList from '../pages/hr/EmployeeList';
import LeaveRequestForm from '../pages/approval/LeaveRequestForm';
import LeavePage from '../pages/approval/LeavePage';
import EvaluationForm from '../pages/hr/EvaluationForm';
import NoticeBoardList from '../pages/NoticeBoard/NoticeBoardList';
import NoticeBoardWrite from '../pages/NoticeBoard/NoticeBoardWrite';
import NoticeBoardDetail from '../pages/NoticeBoard/NoticeBoardDetail';
import NoticeAlertPage from '../pages/NoticeBoard/NoticeAlertPage';
import EmployeeViewList from '../pages/hr/EmployeeViewList';
import ContactList from '../pages/contacts/ContactList';
import MyEvaluationList from '../pages/hr/MyEvaluationList';

const AppRouter = () => {
  const { userRole } = useContext(UserContext); // private 라우터를 이용하기 위해 추가(하준)


  return (
    <Routes>
      <Route path='/' element={<Login />} />
      <Route element={<MainLayout />}>
        <Route path='/dashboard' element={<HRPage />} />
        <Route path='/hr' element={<EmployeeList />} />
        <Route path='/hr/employee-list' element={<EmployeeList />} />
        <Route path='/hr/employee-register' element={<EmployeeRegister />} />
        <Route path='/hr/employee-edit' element={<EmployeeEdit />} />
        <Route path='/hr/employee-eval' element={<EvaluationForm />} />
        <Route path='/hr/employee-eval-list' element={<EmployeeViewList />} />
        <Route path='/hr/my-evaluations' element={<MyEvaluationList />} />
        <Route path='/payroll' element={<></>} />
        <Route path='/approval' element={<LeavePage />} />
        <Route path='/schedule' element={<></>} />
        <Route path='/attendance' element={<></>} />
        <Route path='/noticeboard' element={<NoticeBoardList />} />
        <Route path='/noticeboard/my' element={<NoticeBoardList />} />
        <Route path='/noticeboard/mydepartment' element={<NoticeBoardList />} />
        <Route
          path='/noticeboard/write'
          element={<NoticeBoardWrite isEdit={false} />}
        />
        <Route
          path='/noticeboard/edit/:id'
          element={<NoticeBoardWrite isEdit={true} />}
        />
        <Route path='/noticeboard/alert' element={<NoticeAlertPage />} />
        <Route path='/noticeboard/:id' element={<NoticeBoardDetail />} />
        <Route path='/mail' element={<></>} />
        <Route path='/board' element={<></>} />
        <Route path='/contacts' element={<ContactList />} />
      </Route>
    </Routes>
  );
};

export default AppRouter;
