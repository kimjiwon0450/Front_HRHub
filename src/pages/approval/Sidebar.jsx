import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.scss';
import { UserContext } from '../../context/UserContext';

const Sidebar = () => {
  const { userRole } = useContext(UserContext);

  return (
    <aside className={styles.sidebar}>
      <div className={styles.menu}>
        <div className={styles.menuHeader}>전자결재</div>
        
        <div className={styles.menuGroup}>
          <div className={styles.menuGroupHeader}>기안하기</div>
          <ul className={styles.menuList}>
            <li>
              <NavLink to='/approval/home' className={({ isActive }) => (isActive ? styles.active : '')}>
                새 결재 진행
              </NavLink>
            </li>
            <li>
              <NavLink to='/approval/drafts' className={({ isActive }) => (isActive ? styles.active : '')}>
                결재 진행함
              </NavLink>
            </li>
          </ul>
        </div>

        <div className={styles.menuGroup}>
          <div className={styles.menuGroupHeader}>결재하기</div>
          <ul className={styles.menuList}>
            <li>
              <NavLink to='/approval/box' className={({ isActive }) => (isActive ? styles.active : '')}>
                결재할 문서
              </NavLink>
            </li>
             <li>
              <NavLink to="/approval/cc" className={({ isActive }) => (isActive ? styles.active : '')}>
                수신 참조
              </NavLink>
            </li>
          </ul>
        </div>

        <div className={styles.menuGroup}>
          <div className={styles.menuGroupHeader}>결재 완료함</div>
          <ul className={styles.menuList}>
            <li>
              <NavLink to="/approval/completed" className={({ isActive }) => (isActive ? styles.active : '')}>
                완료 문서
              </NavLink>
            </li>
          </ul>
        </div>
      </div>

      {userRole === 'ADMIN' && (
        <div className={styles.adminMenu}>
          <NavLink to='/admin/service' className={({ isActive }) => (isActive ? styles.active : '')}>
            ⚙️ 서비스 관리
          </NavLink>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
