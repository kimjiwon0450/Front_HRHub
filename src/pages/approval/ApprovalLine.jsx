import React from 'react';
import './ApprovalLine.scss';

const statusIcon = {
  '승인': '✔️', // 초록 체크
  '진행': '🔵', // 파란 원
  '예정': '⏳', // 회색 시계
};

const ApprovalLine = ({ approvers = [] }) => {
  const getStatusStyle = (status) => {
    switch (status) {
      case '승인':
        return 'approved';
      case '진행':
        return 'in-progress';
      case '예정':
        return 'pending';
      default:
        return 'pending';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case '승인':
        return '승인';
      case '진행':
        return '진행';
      case '예정':
        return '예정';
      default:
        return '예정';
    }
  };

  return (
    <div className="approval-line">
      <div className="approval-list">
        {approvers.map((approver, index) => (
          <div
            key={index}
            className={`approval-item ${getStatusStyle(approver.status)}`}
          >
            <div className="approval-row">
              <span className={`approval-status-icon ${getStatusStyle(approver.status)}`}>{statusIcon[approver.status] || '⏳'}</span>
              <span className="approver-name">{approver.name}</span>
              <span className="approver-position">{approver.position}</span>
              <span className="approval-date">{approver.date ? approver.date : '-'}</span>
              <span className={`approval-status ${getStatusStyle(approver.status)}`}>{getStatusText(approver.status)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApprovalLine; 