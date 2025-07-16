import React, { useState, useEffect, useContext } from 'react';

import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import './MainLayout.scss';
import { API_BASE_URL, NOTICE_SERVICE, APPROVAL_SERVICE } from '../configs/host-config';
import { UserContext } from '../context/UserContext';
import axiosInstance from '../configs/axios-config';

const sidebarMenus = [
  { to: '/noticeboard', label: '공지사항', icon: '📢' },
  { to: '/dashboard', label: '대시보드', icon: '📊' },
  { to: '/hr', label: '인사관리', icon: '👥' },
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
  const [unApprovalCount, setUnApprovalCount] = useState(0);
  const { user, userId, accessToken, isInit } = useContext(UserContext);
  const [pendingReports, setPendingReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    const fetchPending = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axiosInstance.get(
          `${API_BASE_URL}${APPROVAL_SERVICE}/reports`,
          {
            params: {
              role: 'approver', // '내가 결재할 차례인 문서'를 의미
              status: 'IN_PROGRESS', // 반려/완료된 문서를 제외하기 위해 반드시 필요
              page: 0,
              size: 10,
            },
          },
        );
        if (res.data?.statusCode === 200) {
          const allReports = res.data.result.reports || [];
          // 이중 필터링: API가 IN_PROGRESS 외 다른 상태를 보내주는 경우를 대비
          const filteredReports = allReports.filter(
            (report) => report.reportStatus === 'IN_PROGRESS',
          );
          console.log('filteredReports : ', filteredReports);
          console.log('filteredReports.length : ', filteredReports.length);
          setPendingReports(filteredReports);

          const count = filteredReports.length;
          setUnApprovalCount(count);
          console.log('미결재 문서 :', count);

        } else {
          setError(
            res.data?.statusMessage ||
            '결재할 문서를 불러오는 데 실패했습니다.',
          );
        }


      } catch (err) {
        console.error(err);
        setError('네트워크 오류 또는 서버 오류');
      } finally {
        setLoading(false);
      }
    };
    fetchPending();
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
            {(unreadCount > 0 || unApprovalCount > 0) && <span className='badge'>{unreadCount + unApprovalCount}</span>}
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
