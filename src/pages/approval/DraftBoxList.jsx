import React, { useState } from 'react';
import './DraftBoxList.scss';
import DraftBoxCard from './DraftBoxCard';

// 임시 데이터
const dummyDrafts = [
  {
    id: 1,
    title: '휴가신청서',
    status: '종결',
    createdAt: '2025-06-23',
    writer: '홍길동 대리',
  },
  {
    id: 2,
    title: '출장신청서',
    status: '회수',
    createdAt: '2025-06-20',
    writer: '홍길동 대리',
  },
];

export default function DraftBoxList() {
  const [filter, setFilter] = useState('종결');

  return (
    <div className="draftbox-list-root">
      <div className="draftbox-header">
        <h2>기안함</h2>
        <div className="draftbox-filter">
          <button className={filter === '종결' ? 'active' : ''} onClick={() => setFilter('종결')}>종결</button>
          <button className={filter === '회수' ? 'active' : ''} onClick={() => setFilter('회수')}>회수</button>
        </div>
      </div>
      <div className="draftbox-list">
        {dummyDrafts
          .filter(d => d.status === filter)
          .map(draft => (
            <DraftBoxCard key={draft.id} draft={draft} />
          ))}
      </div>
    </div>
  );
} 