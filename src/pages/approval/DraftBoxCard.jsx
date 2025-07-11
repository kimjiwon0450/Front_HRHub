import React, { useState } from 'react';
import styles from './DraftBoxCard.module.scss';
import { useNavigate } from 'react-router-dom';
import VisualApprovalLine from '../../components/approval/VisualApprovalLine';
import ApprovalLineModal from '../../components/approval/ApprovalLineModal';

const reportStatusMap = {
  DRAFT: '임시 저장',
  IN_PROGRESS: '결재 진행 중',
  APPROVED: '최종 승인',
  REJECTED: '반려',
  RECALLED: '상신 후 회수',
};

const DraftBoxCard = ({ draft }) => {
  // 3. 컴포넌트 렌더링 시 props 수신 확인 로그
  console.log('DraftBoxCard - 수신된 draft prop:', draft);

  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCardClick = () => {
    // 4. navigate 호출 직전 id 값 확인 로그
    console.log('DraftBoxCard - 클릭 시 draft.id 값:', draft?.id);
    if (draft.reportStatus === 'DRAFT') {
      navigate(`/approval/edit/${draft.id}`);
    } else {
      navigate(`/approval/reports/${draft.id}`);
    }
  };
  
  const handleLineClick = (e) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div className={styles['draftbox-card']} onClick={handleCardClick}>
        <div className={styles['card-left']}>
          <div className={styles['draftbox-title']}>{draft.title}</div>
          <div className={styles['draftbox-info']}>
            <span className={styles['draftbox-status']}>{reportStatusMap[draft.reportStatus] || draft.reportStatus}</span>
            <span>{new Date(draft.createdAt).toLocaleDateString()}</span>
            <span>{draft.name}</span>
          </div>
        </div>
        <div className={styles['card-right']} onClick={handleLineClick}>
          <VisualApprovalLine 
            approvalLine={draft.approvalLines}
            reportStatus={draft.reportStatus}
            mode='summary'
          />
        </div>
      </div>
      {isModalOpen && (
        <ApprovalLineModal
          approvalLine={draft.approvalLines}
          reportStatus={draft.reportStatus}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};

export default DraftBoxCard; 