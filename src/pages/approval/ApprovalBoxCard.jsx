import React from 'react';
import './ApprovalBoxCard.scss';

export default function ApprovalBoxCard({ approval }) {
  return (
    <div className={`approvalbox-card status-${approval.status}`}>
      <div className="approvalbox-title">{approval.title}</div>
      <div className="approvalbox-info">
        <span className="approvalbox-status">{approval.status}</span>
        <span className="approvalbox-date">{approval.createdAt}</span>
        <span className="approvalbox-writer">{approval.writer}</span>
      </div>
    </div>
  );
} 