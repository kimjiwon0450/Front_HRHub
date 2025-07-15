import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import styles from './Sidebar.module.scss';
import { UserContext } from '../../context/UserContext';
import { GearFill } from 'react-bootstrap-icons';

const Sidebar = () => {
  const navigate = useNavigate();
  const { userRole } = useContext(UserContext);

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

        {userRole === 'ADMIN' && (
            <button 
                className={styles.adminSettingsBtn}
                onClick={() => navigate('/approval/admin/templates')}
            >
                <GearFill />
                <span>문서양식관리</span>
            </button>
        )}

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
