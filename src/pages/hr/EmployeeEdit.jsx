import React from 'react';
import './EmployeeEdit.scss';

export default function EmployeeEdit() {
  return (
    <div className='edit-root'>
      <h2 className='edit-title'>정보 수정</h2>
      <form className='edit-form'>
        {/* 2단 폼 + 아바타 */}
        <div className='edit-top-row'>
          <div className='edit-main-col'>
            {/* 이메일 */}
            <label className='edit-label'>이메일</label>
            <div className='edit-email-group'>
              <input
                className='edit-input'
                type='text'
                placeholder="Recipient's username"
                readOnly
              />
              <span className='edit-email-addon'>@example.com</span>
            </div>
            {/* 2단 필드 */}
            <div className='edit-grid'>
              <div>
                <label className='edit-label'>직원명</label>
                <input
                  className='edit-input'
                  type='text'
                  value='Readonly input here...'
                  readOnly
                />
              </div>
              <div>
                <label className='edit-label'>권한</label>
                <input
                  className='edit-input'
                  type='text'
                  value='Readonly input here...'
                  readOnly
                />
              </div>
              <div>
                <label className='edit-label'>부서명</label>
                <input
                  className='edit-input'
                  type='text'
                  value='Readonly input here...'
                  readOnly
                />
              </div>
              <div>
                <label className='edit-label'>주소</label>
                <input
                  className='edit-input'
                  type='text'
                  value='Readonly input here...'
                  readOnly
                />
              </div>
              <div>
                <label className='edit-label'>직급/직책</label>
                <input
                  className='edit-input'
                  type='text'
                  value='Readonly input here...'
                  readOnly
                />
              </div>
              <div>
                <label className='edit-label'>핸드폰</label>
                <input
                  className='edit-input'
                  type='text'
                  value='Readonly input here...'
                  readOnly
                />
              </div>
            </div>
            {/* 메모 */}
            <label className='edit-label'>메모</label>
            <textarea
              className='edit-input edit-textarea'
              value='Readonly input here...'
              readOnly
            />
          </div>
          {/* 아바타 */}
          <div className='edit-avatar-col'>
            <img
              className='edit-avatar'
              src='https://cdn.pixabay.com/photo/2017/01/31/13/14/avatar-2026510_960_720.png'
              alt='profile'
            />
          </div>
        </div>
        {/* 하단 버튼 */}
        <div className='edit-btns'>
          <button type='button' className='btn gray'>
            목록
          </button>
          <button type='submit' className='btn blue'>
            저장
          </button>
          <button type='button' className='btn red'>
            직원 정보 삭제
          </button>
        </div>
      </form>
    </div>
  );
}
