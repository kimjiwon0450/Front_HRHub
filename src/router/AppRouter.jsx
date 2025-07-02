import React, { useContext } from 'react';
import Home from '../components/Home';
import { Route, Routes } from 'react-router-dom';
import PrivateRouter from './PrivateRouter';
import AuthContext from '../context/UserContext';
import Login from '../components/Login';
import MainLayout from '../components/MainLayout';
import Dashboard from '../pages/dashboard/Dashboard';
import HRPage from '../pages/hr/HRPage';
import EmployeeDetail from '../pages/hr/EmployeeDetail';
import EmployeeRegister from '../pages/hr/EmployeeRegister';
import EmployeeEdit from '../pages/hr/EmployeeEdit';
import EmployeeList from '../pages/hr/EmployeeList';
import LeaveRequestForm from '../pages/approval/LeaveRequestForm';
import LeavePage from '../pages/approval/LeavePage';
import EvaluationForm from '../pages/hr/EvaluationForm';

const AppRouter = () => {
  const { userRole } = useContext(AuthContext); // private 라우터를 이용하기 위해 추가(하준)

  return (
    <Routes>
      <Route path='/' element={<Login />} />
      <Route element={<MainLayout />}>
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/hr' element={<HRPage />} />
        <Route path='/hr/employee-list' element={<EmployeeList />} />
        <Route path='/hr/employee-register' element={<EmployeeRegister />} />
        <Route path='/hr/employee-edit' element={<EmployeeEdit />} />
        <Route path='/hr/employee-eval' element={<EvaluationForm />} />
        <Route path='/payroll' element={<></>} />
        <Route path='/approval' element={<LeavePage />} />
        <Route path='/schedule' element={<></>} />
        <Route path='/attendance' element={<></>} />
        <Route path='/notice' element={<></>} />
        <Route path='/mail' element={<></>} />
        <Route path='/board' element={<></>} />
        <Route path='/contacts' element={<></>} />
      </Route>
    </Routes>
  );
};

export default AppRouter;
