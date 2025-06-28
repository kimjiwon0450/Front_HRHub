import React from 'react';
import { Link } from 'react-router-dom';
import './MainLayout.scss';

export default function MainLayout({ children }) {
  return (
    <div className='layout'>
      <aside className='sidebar'>
        <div className='logo'>
          <img src='/logo.png' alt='PetWiz ERP' />
        </div>
        <nav className='nav'>
          <Link to='/notice'>공지사항</Link>
          <Link to='/dashboard'>대시보드</Link>
          <Link to='/hr'>인사관리</Link>
          <Link to='/payroll'>급여관리</Link>
          <Link to='/approval'>전자결재</Link>
          <Link to='/schedule'>일정</Link>
        </nav>
      </aside>

      <div className='main'>
        <header className='header'>
          <div className='menu'>
            <Link to='/dashboard'>메인</Link>
            <Link to='/contacts'>연락처</Link>
            <Link to='/schedule'>일정</Link>
            <Link to='/board'>게시판</Link>
            <Link to='/mail'>메일</Link>
            <Link to='/attendance'>근태</Link>
          </div>
          <button className='logout-btn'>Logout</button>
        </header>

        <main className='content'>{children}</main>
      </div>
    </div>
  );
}
