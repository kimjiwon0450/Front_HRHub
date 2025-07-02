import React from 'react';
import Sidebar from './Sidebar';
import LeaveRequestForm from './LeaveRequestForm';
import './LeavePage.scss';

export default function LeavePage() {
  return (
    <div className='leave-page-root'>
      <Sidebar />
      <div className='main-content'>
        <LeaveRequestForm />
      </div>
    </div>
  );
}
