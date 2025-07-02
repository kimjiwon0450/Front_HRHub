import React, { useContext } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import './MainLayout.scss';
import UserContext from '../context/UserContext';

const sidebarMenus = [
  { to: '/notice', label: '공지사항' },
  { to: '/dashboard', label: '대시보드' },
  { to: '/hr', label: '인사관리' },
  { to: '/approval', label: '전자결재' },
];

const headerMenus = [
  { to: '/dashboard', label: '메인' },
  { to: '/contacts', label: '연락처' },
  { to: '/schedule', label: '일정' },
  { to: '/board', label: '게시판' },
  { to: '/mail', label: '메일' },
  { to: '/attendance', label: '근태' },
];

export default function MainLayout() {
  const location = useLocation();
  const { onLogout } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    onLogout();
    navigate('/');
  };

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
          <button className='logout-btn' onClick={handleLogoutClick}>
            Logout
          </button>
        </header>

        <main className='content'>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
