import React from 'react';
import styles from './ApprovalPendingCard.module.scss';
import { useNavigate } from 'react-router-dom';

const reportStatusMap = {
  DRAFT: '임시 저장',
  IN_PROGRESS: '결재 진행 중',
  APPROVED: '최종 승인',
  REJECTED: '반려',
  RECALLED: '상신 후 회수',
};

const handleBack = () => {
  navigate(-1); // 뒤로가기
};

const approvalStatusMap = {
  PENDING: { color: '#bdbdbd', text: '대기', icon: '⏳' },
  APPROVED: { color: '#4caf50', text: '승인', icon: '✔️' },
  REJECTED: { color: '#f44336', text: '반려', icon: '❌' },
};

const ApprovalPendingCard = ({ report }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/approval/reports/${report.id}`);
  };

  return (
    <div className={styles['approvalpending-card']} onClick={handleClick}>
      {/* 1. 제목과 상태/날짜/작성자를 묶는 컨테이너 추가 */}
      <div className={styles['card-main-content']}>
        <div className={styles['approvalpending-title']}>{report.title}</div>
        <div className={styles['approvalpending-info']}>
          <span className={styles['approvalpending-status']}>{reportStatusMap[report.reportStatus] || report.reportStatus}</span>
          <span className={styles['approvalpending-date']}>{new Date(report.createdAt || report.reportCreatedAt).toLocaleDateString()}</span>
          <span className={styles['approvalpending-writer']}>{report.name}</span>
        </div>
      </div>
      
      {/* 2. 시각적 결재선은 데스크탑에서만 보이도록 별도 div로 감싸기 */}
      {report.approvalLine && (
        <div className={styles['approval-line-desktop']}>
          {/* ... 시각적 결재선 렌더링 로직 (VisualApprovalLine 컴포넌트로 대체하는 것을 추천) ... */}
        </div>
      )}
    </div>
  );
};

export default ApprovalPendingCard; 