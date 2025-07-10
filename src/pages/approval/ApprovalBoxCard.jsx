import React, { useState } from 'react';
import styles from './ApprovalBoxCard.module.scss';
import { useNavigate } from 'react-router-dom';
import VisualApprovalLine from '../../components/approval/VisualApprovalLine';
import ApprovalLineModal from '../../components/approval/ApprovalLineModal';

const ApprovalBoxCard = ({ report }) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCardClick = () => {
    if (report?.id) {
      navigate(`/approval/reports/${report.id}`);
    } else {
      console.error('클릭된 보고서의 ID가 유효하지 않습니다.', report);
      // 사용자에게 알림을 보여주는 로직을 추가할 수 있습니다.
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
      <div className={styles['approvalbox-card']} onClick={handleCardClick}>
        <div className={styles['card-left']}>
          <div className={styles['approval-title']}>{report.title}</div>
          <div className={styles['approval-info']}>
            <span>{report.drafter.name}</span>
            <span>{new Date(report.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <div className={styles['card-right']} onClick={handleLineClick}>
          <VisualApprovalLine
            approvalLine={report.approvalLine}
            reportStatus={report.reportStatus}
            mode='summary'
          />
        </div>
      </div>
      {isModalOpen && (
        <ApprovalLineModal
          approvalLine={report.approvalLine}
          reportStatus={report.reportStatus}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};

export default ApprovalBoxCard; 