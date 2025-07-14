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
      {approvalLine.map((approver, index) => {
        // PENDING 상태인 사람은 결재 완료 시점에서 표시할 필요가 없을 수 있으나,
        // 반려 시 다음 결재자가 누구인지 보여주기 위해 일단 모두 표시합니다.
        const isLastParticipatingApprover = 
          isConcluded && 
          (index === approvalLine.length - 1 || approvalLine[index + 1].approvalStatus === 'PENDING');

        return (
          <React.Fragment key={approver.employeeId}>
            <div className={`${styles.approverNode} ${getStatusClass(approver.approvalStatus)}`}>
              <span className={styles.statusIcon}>
                {approver.approvalStatus === 'APPROVED' && '✔'}
                {approver.approvalStatus === 'REJECTED' && '✖'}
                {approver.approvalStatus === 'PENDING' && '✎'}
              </span>
              <span className={styles.approverName}>{approver.name}</span>
            </div>
            {/* 결재가 완료되었을 때 마지막 참여자 뒤에는 화살표를 표시하지 않음 */}
            {!isLastParticipatingApprover && <div className={styles.arrow}>→</div>}
          </React.Fragment>
        );
      })}
    </>
  );

  const renderSummaryLine = () => {
    // 1. 결재가 완료된 경우 (APPROVED, REJECTED)
    if (isConcluded) {
      return (
        <>
          {approvalLine.map((approver, index) => {
            // 결재에 참여한 사람만 표시 (예: PENDING 상태는 제외)
            if (approver.approvalStatus === 'PENDING') return null;

            return (
              <React.Fragment key={approver.employeeId}>
                <div className={`${styles.approverNode} ${getStatusClass(approver.approvalStatus)}`}>
                  <span className={styles.statusIcon}>
                    {approver.approvalStatus === 'APPROVED' && '✔'}
                    {approver.approvalStatus === 'REJECTED' && '✖'}
                  </span>
                  <span className={styles.approverName}>{approver.name}</span>
                </div>
                {/* 마지막 결재자가 아니고, 다음 결재자가 PENDING이 아닐 때만 화살표 표시 */}
                {index < approvalLine.length - 1 && approvalLine[index + 1].approvalStatus !== 'PENDING' && (
                  <div className={styles.arrow}>→</div>
                )}
              </React.Fragment>
            );
          })}
        </>
      );
    }

    // 2. 결재가 진행중인 경우 (기존 로직과 유사하게)
    const pendingIndex = approvalLine.findIndex(a => a.approvalStatus === 'PENDING');
    if (pendingIndex === -1) { // PENDING이 없으면 마지막 승인자 표시
      const lastApprover = approvalLine[approvalLine.length - 1];
        return (
            <div className={`${styles.approverNode} ${styles.approved}`}>
              <span className={styles.statusIcon}>✔</span>
              <span className={styles.approverName}>{lastApprover.name}</span>
            </div>
        );
    }
    
    // 현재 결재자 중심으로 앞뒤 1명씩만 표시
    const summaryApprovers = approvalLine.slice(Math.max(0, pendingIndex - 1), pendingIndex + 2);

    return (
        <>
            {pendingIndex > 1 && <div className={styles.ellipsis}>...</div>}
            {summaryApprovers.map((approver, index) => (
                <React.Fragment key={approver.employeeId}>
                    <div className={`${styles.approverNode} ${getStatusClass(approver.approvalStatus)}`}>
                      <span className={styles.statusIcon}>
                        {approver.approvalStatus === 'APPROVED' && '✔'}
                        {approver.approvalStatus === 'REJECTED' && '✖'}
                        {approver.approvalStatus === 'PENDING' && '✎'}
                      </span>
                      <span className={styles.approverName}>{approver.name}</span>
                    </div>
                    {/* 진행 중일 때는 다음 사람이 있으면 항상 화살표 표시 */}
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