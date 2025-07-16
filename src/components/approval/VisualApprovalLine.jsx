import React from 'react';
import styles from './VisualApprovalLine.module.scss';

const VisualApprovalLine = ({ approvalLine, reportStatus, mode = 'full' }) => {
  if (!approvalLine || approvalLine.length === 0) {
    // mode가 'summary'일 때는 간단한 텍스트를, 'full'일 때는 더 명확한 메시지를 표시
    return <div className={styles.noApprovers}>{mode === 'summary' ? '' : '결재선 정보 없음'}</div>;
  }

  const getStatusClass = (status) => {
    switch (status) {
      case 'APPROVED': return styles.approved;
      case 'REJECTED': return styles.rejected;
      default: return styles.pending;
    }
  };

  const isNewDraft = !approvalLine.some(a => a.approvalStatus);

  // 결재선 렌더링 로직 통일
  const renderLine = () => (
    <>
      {approvalLine.map((approver, index) => (
        <React.Fragment key={approver.id || approver.employeeId}>
          <div className={`${styles.approverNode} ${getStatusClass(approver.approvalStatus)}`}>
            {/* 새 문서 작성 시에는 아이콘 숨김 */}
            {!isNewDraft && (
              <span className={styles.statusIcon}>
                {approver.approvalStatus === 'APPROVED' && '✔'}
                {approver.approvalStatus === 'REJECTED' && '✖'}
                {approver.approvalStatus === 'PENDING' && '✎'}
              </span>
            )}
            <span className={styles.approverName}>{approver.name}</span>
          </div>
          {index < approvalLine.length - 1 && <div className={styles.arrow}>→</div>}
        </React.Fragment>
      ))}
    </>
  );

  // 요약 모드는 추후 필요 시 확장 (현재는 전체 라인만 사용)
  const renderSummaryLine = () => {
    // 간단히 이름만 나열하는 방식으로 변경
    return <div className={styles.summaryText}>{approvalLine.map(a => a.name).join(', ')}</div>;
  };

  return (
    <div className={styles.approvalLineContainer}>
      {mode === 'full' ? renderLine() : renderSummaryLine()}
    </div>
  );
};

export default VisualApprovalLine; 