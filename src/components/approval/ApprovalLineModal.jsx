import React from 'react';
import styles from './ApprovalLineModal.module.scss';
import VisualApprovalLine from './VisualApprovalLine';

const ApprovalLineModal = ({ approvalLine, reportStatus, onClose }) => {
  if (!approvalLine) return null;

  const getStatusText = (status) => {
    switch (status) {
      case 'APPROVED':
        return '승인';
      case 'REJECTED':
        return '반려';
      case 'PENDING':
        return '대기';
      default:
        return status;
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>결재선 정보</h3>
          <button onClick={onClose} className={styles.closeButton}>&times;</button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.visualLineWrapper}>
            <VisualApprovalLine 
              approvalLine={approvalLine} 
              reportStatus={reportStatus}
              mode="full" 
            />
          </div>
          <table className={styles.approvalTable}>
            <thead>
              <tr>
                <th>순서</th>
                <th>결재자</th>
                <th>직위</th>
                <th>상태</th>
                <th>처리일시</th>
              </tr>
            </thead>
            <tbody>
              {approvalLine.map((approver, index) => (
                <tr key={approver.id}>
                  <td>{index + 1}</td>
                  <td>{approver.name}</td>
                  <td>{approver.position}</td>
                  <td className={styles[approver.status.toLowerCase()]}>
                    {getStatusText(approver.status)}
                  </td>
                  <td>{approver.approvedAt ? new Date(approver.approvedAt).toLocaleString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ApprovalLineModal; 