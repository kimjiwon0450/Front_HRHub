
import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './ApprovalBottomNav.module.scss';
import { House, Clock, HourglassSplit, Check2Circle, Folder2 } from 'react-bootstrap-icons'; // 예시 아이콘

const ApprovalBottomNav = () => {
  const navItems = [
    { to: "/approval/home", icon: <House />, label: "홈" },
    { to: "/approval/pending", icon: <Clock />, label: "예정" },
    { to: "/approval/in-progress", icon: <HourglassSplit />, label: "진행" },
    { to: "/approval/completed", icon: <Check2Circle />, label: "완료" },
    { to: "/approval/drafts", icon: <Folder2 />, label: "임시" }
  ];

  return (
    <nav className={styles.bottomNav}>
      {navItems.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
        >
          <div className={styles.icon}>{item.icon}</div>
          <div className={styles.label}>{item.label}</div>
        </NavLink>
      ))}
    </nav>
  );
};

export default ApprovalBottomNav;