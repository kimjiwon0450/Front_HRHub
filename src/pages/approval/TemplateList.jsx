import React from 'react';
import { useNavigate } from 'react-router-dom';
import './TemplateList.scss';

const templates = [
  {
    id: 'leave',
    title: '휴가신청서',
    description: '연차, 반차 등 휴가를 신청할 때 사용합니다.',
    icon: '🌴',
    path: '/approval/templates/leave',
  },
  // 필요시 다른 템플릿 추가
  // {
  //   id: 'business-trip',
  //   title: '출장신청서',
  //   description: '출장을 신청할 때 사용합니다.',
  //   icon: '✈️',
  //   path: '/approval/templates/business-trip',
  // },
];

export default function TemplateList() {
  const navigate = useNavigate();

  return (
    <div className="template-list-root">
      <h2>보고서 템플릿</h2>
      <div className="template-list">
        {templates.map((tpl) => (
          <div
            className="template-card"
            key={tpl.id}
            onClick={() => navigate(tpl.path)}
          >
            <div className="template-icon">{tpl.icon}</div>
            <div className="template-info">
              <div className="template-title">{tpl.title}</div>
              <div className="template-desc">{tpl.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 