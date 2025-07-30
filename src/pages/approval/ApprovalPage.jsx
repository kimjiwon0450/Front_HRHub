// /src/pages/approval/ApprovalPage.jsx

import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar'; // 데스크탑용 사이드바
import ApprovalBottomNav from './ApprovalBottomNav'; // 모바일용 하단 탭 메뉴 (새로 만들 컴포넌트)
import styles from './ApprovalPage.module.scss';
import useWindowDimensions from '../../hooks/useWindowDimensions';

const ApprovalPage = () => {
  const { width } = useWindowDimensions(); // 현재 화면 너비 가져오기
  const isMobile = width < 768; // 모바일 브레이크포인트

  return (
    <div className={styles.approvalPageContainer}>
      {/* 화면 크기에 따라 다른 메뉴를 렌더링 */}
      {!isMobile && <Sidebar />}
      
      <main className={styles.content}>
        <Outlet />
      </main>
      
      {isMobile && <ApprovalBottomNav />}
    </div>
  );
};

export default ApprovalPage;