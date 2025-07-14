import React from 'react';
import DraftBoxCard from './DraftBoxCard';

/**
 * CcBox로부터 받은 데이터를 DraftBoxCard가 사용할 수 있는 props 형식으로 변환(Adapt)하는 컴포넌트입니다.
 * 
 * 데이터 필드 이름의 불일치 문제를 해결합니다.
 * - approvalLine -> approvalLines
 * - submittedAt -> createdAt
 * - title -> title (유지)
 * - ... 등 필요한 필드 매핑
 */
const CcBoxCard = ({ doc }) => {
  // DraftBoxCard가 기대하는 데이터 구조로 변환
  const adaptedDraft = {
    ...doc,
    approvalLines: doc.approvalLine || [], // 백엔드 응답에 없으므로, 빈 배열로 안전하게 처리
    createdAt: doc.reportCreatedAt, // 'reportCreatedAt'을 'createdAt'으로 매핑
    writer: { name: doc.name },       // 'name'을 'writer.name' 구조로 매핑
  };

  return <DraftBoxCard draft={adaptedDraft} />;
};

export default CcBoxCard; 