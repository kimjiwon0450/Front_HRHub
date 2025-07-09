import React from 'react';
import './DraftBoxCard.scss';

export default function DraftBoxCard({ draft }) {
  return (
    <div className={`draftbox-card ${draft.status === '종결' ? 'closed' : 'recalled'}`}>
      <div className="draftbox-title">{draft.title}</div>
      <div className="draftbox-info">
        <span className="draftbox-status">{draft.status}</span>
        <span className="draftbox-date">{draft.createdAt}</span>
        <span className="draftbox-writer">{draft.writer}</span>
      </div>
    </div>
  );
} 