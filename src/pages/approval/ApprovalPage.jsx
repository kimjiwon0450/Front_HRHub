// /src/pages/approval/ApprovalPage.jsx

import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import ApprovalBottomNav from './ApprovalBottomNav'; // 새로 만든 하단 탭 메뉴 import
import styles from './ApprovalPage.module.scss';
import useWindowDimensions from '../../hooks/useWindowDimensions'; // 새로 만든 훅 import

const ApprovalPage = () => {
  const { width } = useWindowDimensions();
  const isMobile = width < 768; // 모바일 기준점 (768px)

  return (
    // isMobile 상태에 따라 클래스 이름을 동적으로 부여
    <div className={`${styles.approvalPageContainer} ${isMobile ? styles.mobileLayout : ''}`}>
      {/* 데스크탑일 때만 사이드바 렌더링 */}
      {!isMobile && <Sidebar />}
      
      <main className={styles.content}>
        <Outlet />
      </main>
      
      {/* 모바일일 때만 하단 탭 메뉴 렌더링 */}
      {isMobile && <ApprovalBottomNav />}
    </div>
  );
};

export default ApprovalPage;