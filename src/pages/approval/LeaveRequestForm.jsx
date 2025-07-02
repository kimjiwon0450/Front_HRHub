// LeaveRequestForm.jsx
import React from 'react';
import './LeaveRequestForm.scss';

export default function LeaveRequestForm() {
  return (
    <div className='leave-form-root'>
      <h2>휴가신청서</h2>
      <form className='leave-form-table'>
        <div className='row'>
          <div className='cell label'>제목</div>
          <div className='cell input' colSpan={3}>
            <input type='text' className='text-input' />
          </div>
        </div>
        <div className='row'>
          <div className='cell label'>열람/공람자</div>
          <div className='cell input' colSpan={3}>
            <input type='text' className='text-input' />
          </div>
        </div>
        <div className='row'>
          <div className='cell label'>휴가 종류</div>
          <div className='cell input'>
            <select className='select-input'>
              <option>선택</option>
              {/* 휴가 종류 옵션 추가 */}
            </select>
            <label className='checkbox-label'>
              <input type='checkbox' />
              <span>반차 사용</span>
            </label>
          </div>
        </div>
        <div className='row'>
          <div className='cell label'>휴가 기간</div>
          <div className='cell input'>
            <input type='date' className='date-input' />
            <span className='date-sep'>~</span>
            <input type='date' className='date-input' />
            <span className='total-day'>
              (총 <span className='total-num'>일</span> 일)
            </span>
          </div>
        </div>
        <div className='row reason-row'>
          <div className='cell label'>휴가 사유</div>
          <div className='cell input' colSpan={3}>
            <textarea className='reason-textarea' rows={3}></textarea>
          </div>
        </div>
      </form>
    </div>
  );
}
