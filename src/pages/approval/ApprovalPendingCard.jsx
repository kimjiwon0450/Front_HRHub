import React from 'react';
import './ApprovalPendingCard.scss';
import ApprovalLine from './ApprovalLine';

export default function ApprovalPendingCard({ report }) {
  return (
    <div className="approvalpending-card">
      <div className="approvalpending-title">{report.title}</div>
      <div className="approvalpending-info">
        <span className="approvalpending-status">{report.status}</span>
        <span className="approvalpending-date">{report.createdAt}</span>
        <span className="approvalpending-writer">{report.writer}</span>
      </div>
      {report.approvalLine && <ApprovalLine approvers={report.approvalLine} />}
    </div>
  );
} 