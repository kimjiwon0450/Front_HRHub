import React, { useState, useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import styles from './Sidebar.module.scss';
import { UserContext } from '../../context/UserContext';
import { GearFill } from 'react-bootstrap-icons';
import TemplateSelectionModal from '../../components/approval/TemplateSelectionModal';
import ModalPortal from '../../components/approval/ModalPortal';

const Sidebar = () => {
  const navigate = useNavigate();
  const { userRole, counts } = useContext(UserContext);
  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
  
  const safeCounts = counts || {};
  
  // ★★★ 메뉴 데이터를 배열로 관리하여 코드를 더 깔끔하게 만듭니다. ★★★
  const menuItems = [
    { to: "/approval/pending", label: "결재 예정 문서함", count: safeCounts.pending || 0, isPrimary: true },
    { to: "/approval/in-progress", label: "내 결재함", count: safeCounts.inProgress || 0 },
    { to: "/approval/completed", label: "완료 문서함", count: safeCounts.completed || 0 },
    { to: "/approval/rejected", label: "내 반려함", count: safeCounts.rejected || 0 },
    { to: "/approval/drafts", label: "내 임시저장함", count: safeCounts.drafts || 0 },
    { to: "/approval/scheduled", label: "내 예약함", count: safeCounts.scheduled || 0 },
    { to: "/approval/cc", label: "수신 참조 문서함", count: safeCounts.cc || 0 },
  ];

  return (
    <>
      <aside className={styles.sidebar}>
        <nav className={styles.menu}>
          <div className={styles.menuHeader} onClick={() => navigate('/approval/home')}>
            전자결재
          </div>
          <button className={styles.newApprovalBtn} onClick={() => setIsSelectionModalOpen(true)}>
            + 새 결재 작성
          </button>
          {userRole === 'ADMIN' && (
            <button className={styles.adminSettingsBtn} onClick={() => navigate('/approval/admin/templates')}>
              <GearFill />
              <span>문서양식관리</span>
            </button>
          )}
          <div className={styles.menuGroup}>
            <div className={styles.menuGroupHeader}>결재함</div>
            <ul className={styles.menuList}>
              {/* ★★★ 배열을 map으로 돌려 렌더링합니다. */}
              {menuItems.map(item => (
                <li key={item.to}>
                  <NavLink to={item.to} className={({ isActive }) => `${styles.menuItem} ${isActive ? styles.active : ''}`}>
                    <span>{item.label}</span>
                    {/* ★★★ isPrimary 값에 따라 다른 클래스를 적용합니다. ★★★ */}
                    <span 
                      className={`${styles.countBadge} ${item.isPrimary ? styles.primaryBadge : styles.secondaryBadge}`} 
                      data-count={item.count}
                    >
                      {item.count}
                    </span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </aside>

      {isSelectionModalOpen && (
        <ModalPortal>
          <TemplateSelectionModal
            open={isSelectionModalOpen}
            onClose={() => setIsSelectionModalOpen(false)}
            onStartWriting={(templateId) => {
              setIsSelectionModalOpen(false);
              navigate(`/approval/new?templateId=${templateId}`);
            }}
          />
        </ModalPortal>
      )}
    </>
  );
};

export default Sidebar;