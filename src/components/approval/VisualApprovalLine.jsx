import React from 'react';
import styles from './VisualApprovalLine.module.scss';

const VisualApprovalLine = ({ approvalLine, reportStatus, mode = 'full' }) => {
  if (!approvalLine || approvalLine.length === 0) {
    return <div className={styles.noApprovers}>결재선 정보 없음</div>;
  }

  const getStatusClass = (status) => {
    switch (status) {
      case 'APPROVED': return styles.approved;
      case 'REJECTED': return styles.rejected;
      default: return styles.pending;
    }
  };

  const isConcluded = reportStatus === 'APPROVED' || reportStatus === 'REJECTED';

  const renderFullLine = () => (
    <>
      {approvalLine.map((approver, index) => (
        <React.Fragment key={approver.id}>
          <div className={`${styles.approverNode} ${getStatusClass(approver.status)}`}>
            <div className={styles.approverName}>{approver.name}</div>
          </div>
          {index < approvalLine.length - 1 && <div className={styles.arrow}>→</div>}
        </React.Fragment>
      ))}
      {isConcluded && (
        <>
          <div className={styles.arrow}>→</div>
          <div className={`${styles.finalNode} ${reportStatus === 'APPROVED' ? styles.finalApproved : styles.finalRejected}`}>
            <span className={styles.finalIcon}>{reportStatus === 'APPROVED' ? '✔' : '✖'}</span>
            <span>{reportStatus === 'APPROVED' ? '최종 승인' : '반려'}</span>
          </div>
        </>
      )}
    </>
  );

  const renderSummaryLine = () => {
    if (isConcluded) {
      const finalApprover = approvalLine.find(a => a.status === 'REJECTED') || approvalLine[approvalLine.length - 1];
      return (
        <div className={`${styles.approverNode} ${getStatusClass(finalApprover.status)}`}>
          <div className={styles.approverName}>{finalApprover.name}</div>
          <div className={styles.approverStatus}>{finalApprover.status === 'APPROVED' ? '승인' : '반려'}</div>
        </div>
      );
    }

    const pendingIndex = approvalLine.findIndex(a => a.status === 'PENDING');
    if (pendingIndex === -1) { // 모두 승인했지만 아직 최종 승인 전
      const lastApprover = approvalLine[approvalLine.length -1];
        return (
            <div className={`${styles.approverNode} ${getStatusClass(lastApprover.status)}`}>
                <div className={styles.approverName}>{lastApprover.name}</div>
                <div className={styles.approverStatus}>승인</div>
            </div>
        );
    }
    
    const summaryApprovers = approvalLine.slice(Math.max(0, pendingIndex - 1), pendingIndex + 2);

    return (
        <>
            {pendingIndex > 1 && <div className={styles.ellipsis}>...</div>}
            {summaryApprovers.map((approver, index) => (
                <React.Fragment key={approver.id}>
                    <div className={`${styles.approverNode} ${getStatusClass(approver.status)}`}>
                        <div className={styles.approverName}>{approver.name}</div>
                    </div>
                    {index < summaryApprovers.length - 1 && <div className={styles.arrow}>→</div>}
                </React.Fragment>
            ))}
            {pendingIndex < approvalLine.length - 2 && <div className={styles.ellipsis}>...</div>}
        </>
    );
  };

  return (
    <div className={styles.approvalLineContainer}>
      {mode === 'full' ? renderFullLine() : renderSummaryLine()}
    </div>
  );
};

export default VisualApprovalLine; 