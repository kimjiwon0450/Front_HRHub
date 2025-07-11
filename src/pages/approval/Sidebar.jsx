import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import styles from './Sidebar.module.scss';

const Sidebar = () => {
  const navigate = useNavigate();

  return (
    <aside className={styles.sidebar}>
      <nav className={styles.menu}>
        <div className={styles.menuHeader}>전자결재</div>

        <ul className={styles.menuList}>
          <li>
            <NavLink
              to='/approval/home'
              className={({ isActive }) =>
                `${styles.menuItem} ${isActive ? styles.active : ''}`
              }
            >
              결재 홈
            </NavLink>
          </li>
        </ul>

        <button
          className={styles.newApprovalBtn}
          onClick={() => navigate('/approval/new')}
        >
          + 새 결재 작성
        </button>

        <div className={styles.menuGroup}>
          <div className={styles.menuGroupHeader}>결재함</div>
          <ul className={styles.menuList}>
            <li>
              <NavLink
                to='/approval/pending'
                className={({ isActive }) =>
                  `${styles.menuItem} ${isActive ? styles.active : ''}`
                }
              >
                결재할 문서
              </NavLink>
            </li>
            <li>
              <NavLink
                to='/approval/in-progress'
                className={({ isActive }) =>
                  `${styles.menuItem} ${isActive ? styles.active : ''}`
                }
              >
                결재 진행함
              </NavLink>
            </li>
            <li>
              <NavLink
                to='/approval/completed'
                className={({ isActive }) =>
                  `${styles.menuItem} ${isActive ? styles.active : ''}`
                }
              >
                완료 문서함
              </NavLink>
            </li>
            <li>
              <NavLink
                to='/approval/drafts'
                className={({ isActive }) =>
                  `${styles.menuItem} ${isActive ? styles.active : ''}`
                }
              >
                임시 저장함
              </NavLink>
            </li>
            <li>
              <NavLink
                to='/approval/cc'
                className={({ isActive }) =>
                  `${styles.menuItem} ${isActive ? styles.active : ''}`
                }
              >
                수신 참조함
              </NavLink>
            </li>
          </ul>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
