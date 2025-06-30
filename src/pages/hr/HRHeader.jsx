import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './HRHeader.scss';

const menus = [
  { label: '홈', path: '/hr' },
  { label: '인사조회', path: '/hr/employee-detail' },
  { label: '커뮤니티', path: '/community' },
  { label: '교육', path: '/edu' },
  { label: '다운로드', path: '/download' },
  { label: '신규등록', path: '/hr/employee-register' },
  { label: '환경설정', path: '/settings' },
];

export default function HRHeader() {
  const location = useLocation();

  return (
    <nav className='hr-nav'>
      {menus.map((menu) => (
        <Link
          key={menu.path}
          to={menu.path}
          className={location.pathname === menu.path ? 'active' : ''}
        >
          {menu.label}
        </Link>
      ))}
    </nav>
  );
}
