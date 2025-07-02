import React from 'react';
import './Sidebar.scss';

export default function Sidebar() {
  return (
    <div className='sidebar-container'>
      {/* 왼쪽 컬럼 */}
      <div className='sidebar-left'>
        <button className='draft-btn'>기안서 작성</button>
        <div className='approve-status'>
          <div>
            결재 대기 <span>0</span>
          </div>
          <div>
            결재 요청 <span>0</span>
          </div>
        </div>
        <div className='menu-section'>
          <div className='menu-title'>▼ 기안함</div>
          <div className='menu-item'>종결</div>
          <div className='menu-item'>회수</div>
        </div>
        <div className='menu-section'>
          <div className='menu-title'>▼ 결재함</div>
          <div className='menu-item'>미결</div>
          <div className='menu-item'>종결</div>
          <div className='menu-item'>열람/공람</div>
        </div>
      </div>
      {/* 오른쪽 컬럼 */}
      <div className='sidebar-right'>
        <div className='doc-list'>
          <div className='doc-item'>지출결의서</div>
          <div className='doc-item selected'>휴가신청서</div>
          <div className='doc-item'>휴직원</div>
          <div className='doc-item'>육아휴직신청서</div>
          <div className='doc-item'>병가휴직신청서</div>
          <div className='doc-item'>복직원</div>
          <div className='doc-item'>출장신청서</div>
          <div className='doc-item'>회의보고서</div>
          <div className='doc-item'>주간업무보고</div>
          <div className='doc-item'>업무협조요청서</div>
          <div className='doc-item'>외부교육 참석보고서</div>
          <div className='doc-item'>외근계획서</div>
          <div className='doc-item'>조퇴신청서</div>
          <div className='doc-item'>경조금지급신청서</div>
          <div className='doc-item'>영업보고서</div>
          <div className='doc-item'>업무보고서</div>
          <div className='doc-item'>기안서</div>
          <div className='doc-item'>품의서</div>
          <div className='doc-item'>증명서 신청</div>
        </div>
      </div>
    </div>
  );
}
