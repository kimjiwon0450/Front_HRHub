import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './HRHeader.scss';

const menus = [
  { label: '홈', path: '/hr' },
  { label: '인사조회', path: '/hr/employee-list' },
  { label: '인사평가 조회', path: '/hr/employee-eval-list' },
  { label: '커뮤니티', path: '/community' },
  { label: '신규등록', path: '/hr/employee-register' },
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
