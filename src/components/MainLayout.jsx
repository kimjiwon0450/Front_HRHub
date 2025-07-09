import React, { useState, useEffect, useContext } from 'react';

import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import './MainLayout.scss';
import { API_BASE_URL, NOTICE_SERVICE } from '../configs/host-config';
import { UserContext } from '../context/UserContext';

const sidebarMenus = [
  { to: '/noticeboard', label: '공지사항', icon: '📢' },
  { to: '/dashboard', label: '대시보드', icon: '📊' },
  { to: '/hr/employee-list', label: '인사관리', icon: '👥' },
  { to: '/approval', label: '전자결재', icon: '✍️' },
];

const headerMenus = [
  { to: '/dashboard', label: '메인', icon: '🏠' },
  { to: '/contacts', label: '연락처', icon: '📞' },
  // { to: '/schedule', label: '일정', icon: '📅' },
  // { to: '/board', label: '게시판' },
  // { to: '/mail', label: '메일', icon: '✉️' },
  // { to: '/attendance', label: '근태', icon: '🕒' },
];

export default function MainLayout() {
  const location = useLocation();
  const { onLogout } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    onLogout();
    navigate('/');
  };

  const [unreadCount, setUnreadCount] = useState(0);
  const { user, userId, accessToken, isInit } = useContext(UserContext);

  useEffect(() => {
    if (!userId) return;

    const fetchUnreadCount = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}${NOTICE_SERVICE}/noticeboard/unread-count`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );
        const count = await res.json();
        setUnreadCount(count);
        console.log('안 읽은 게시글 수 :', count);
      } catch (err) {
        console.log('안 읽은 게시글 수 조회 실패:', err);
      }
    };

    fetchUnreadCount();
  }, [user, location.pathname]);

  return (
    <div className='layout'>
      <aside className='sidebar'>
        <div className='logo' onClick={() => navigate('/dashboard')}>
          <img src='/src/assets/hrhub_logo.png' alt='hrhub' />
        </div>
        <nav className='nav'>
          {sidebarMenus.map((menu) => (
            <Link
              key={menu.to}
              to={menu.to}
              className={location.pathname.startsWith(menu.to) ? 'active' : ''}
            >
              <span className='menu-icon'>{menu.icon}</span>
              <span className='menu-label'>{menu.label}</span>
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
                <span className='header-menu-icon'>{menu.icon}</span>
                <span className='header-menu-label'>{menu.label}</span>
              </Link>
            ))}
          </div>

          <div
            className='notice-icon'
            onClick={() => navigate('/noticeboard/alert')}
          >
            📢
            {unreadCount > 0 && <span className='badge'>{unreadCount}</span>}
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
