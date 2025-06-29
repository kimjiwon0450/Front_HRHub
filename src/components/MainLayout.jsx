import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './MainLayout.scss';

const sidebarMenus = [
  { to: '/notice', label: '공지사항' },
  { to: '/dashboard', label: '대시보드' },
  { to: '/hr', label: '인사관리' },
  { to: '/payroll', label: '급여관리' },
  { to: '/approval', label: '전자결재' },
  { to: '/schedule', label: '일정' },
];

const headerMenus = [
  { to: '/dashboard', label: '메인' },
  { to: '/contacts', label: '연락처' },
  { to: '/schedule', label: '일정' },
  { to: '/board', label: '게시판' },
  { to: '/mail', label: '메일' },
  { to: '/attendance', label: '근태' },
];

export default function MainLayout({ children }) {
  const location = useLocation();

  return (
    <div className='layout'>
      <aside className='sidebar'>
        <div className='logo'>
          <img src='/logo.png' alt='PetWiz ERP' />
        </div>
        <nav className='nav'>
          {sidebarMenus.map((menu) => (
            <Link
              key={menu.to}
              to={menu.to}
              className={location.pathname.startsWith(menu.to) ? 'active' : ''}
            >
              {menu.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className='main'>
        <header className='header'>
          <div className='menu'>
            {headerMenus.map((menu) => (
              <Link
                key={menu.to}
                to={menu.to}
                className={
                  location.pathname.startsWith(menu.to) ? 'active' : ''
                }
              >
                {menu.label}
              </Link>
            ))}
          </div>
          <button className='logout-btn'>Logout</button>
        </header>

        <main className='content'>{children}</main>
      </div>
    </div>
  );
}
