import React, { useState } from 'react';
import './ApprovalBoxList.scss';
import ApprovalBoxCard from './ApprovalBoxCard';

// 임시 데이터
const dummyApprovals = [
  {
    id: 1,
    title: '휴가신청서',
    status: '미결',
    createdAt: '2025-06-23',
    writer: '김철수 대리',
  },
  {
    id: 2,
    title: '출장신청서',
    status: '종결',
    createdAt: '2025-06-20',
    writer: '이영희 부장',
  },
  {
    id: 3,
    title: '경조사신청서',
    status: '열람',
    createdAt: '2025-06-19',
    writer: '박민수 과장',
  },
];

const statusList = ['미결', '종결', '열람'];

export default function ApprovalBoxList() {
  const [filter, setFilter] = useState('미결');

  return (
    <div className="approvalbox-list-root">
      <div className="approvalbox-header">
        <h2>결재함</h2>
        <div className="approvalbox-filter">
          {statusList.map(status => (
            <button
              key={status}
              className={filter === status ? 'active' : ''}
              onClick={() => setFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>
      </div>
      <div className="approvalbox-list">
        {dummyApprovals
          .filter(a => a.status === filter)
          .map(approval => (
            <ApprovalBoxCard key={approval.id} approval={approval} />
          ))}
      </div>
    </div>
  );
} 