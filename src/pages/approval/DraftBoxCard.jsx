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

  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCardClick = () => {
    if (draft.reportStatus === 'DRAFT' || draft.reportStatus === 'RECALLED') {
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
        <div className={styles['card-header']}>
          <span className={styles['template-name']}>
            {draft.templateName || '일반 문서'}
          </span>
          <span
            className={`${styles['draftbox-status']} ${
              styles[draft.reportStatus?.toLowerCase()]
            }`}
          >
            {reportStatusMap[draft.reportStatus] || draft.reportStatus}
          </span>
        </div>
        <div className={styles['card-body']}>
          <div className={styles['draftbox-title']}>{draft.title}</div>
          <div className={styles['draftbox-info']}>
            <span>{draft.writer?.name}</span>
            <span>{new Date(draft.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <div className={styles['card-right']} onClick={handleLineClick}>
          <VisualApprovalLine
            approvalLine={draft.approvalLines || []}
            reportStatus={draft.reportStatus}
            mode='summary'
          />
        </div>
      </div>
      {isModalOpen && (
        <ApprovalLineModal
          approvalLine={draft.approvalLines || []}
          reportStatus={draft.reportStatus}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};

export default DraftBoxCard; 