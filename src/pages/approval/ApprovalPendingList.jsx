import React from 'react';
import './ApprovalPendingList.scss';
import ApprovalPendingCard from './ApprovalPendingCard';

// 임시 데이터
const dummyReports = [
  {
    id: 1,
    title: '본부 전자결재 회의록',
    status: '대기',
    createdAt: '2025-06-23',
    writer: '서영락 대리',
    approvalLine: [
      { name: '서영락 대리', position: '대리', status: '승인', date: '2025-06-23' },
      { name: '강철중 팀장', position: '팀장', status: '진행', date: null },
    ],
  },
  {
    id: 2,
    title: '본부 전자결재 서비스 연동 회의',
    status: '요청',
    createdAt: '2025-06-22',
    writer: '강철중 팀장',
    approvalLine: [
      { name: '서영락 대리', position: '대리', status: '승인', date: '2025-06-22' },
      { name: '강철중 팀장', position: '팀장', status: '예정', date: null },
    ],
  },
];

export default function ApprovalPendingList() {
  return (
    <div className="approval-pending-list">
      <h2>결재 대기/요청</h2>
      <div className="approval-pending-list-inner">
        {dummyReports.map(report => (
          <ApprovalPendingCard key={report.id} report={report} />
        ))}
      </div>
    </div>
  );
} 