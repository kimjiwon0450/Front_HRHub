import React, { useState } from 'react';
import './EmployeeRegister.scss';
import HRHeader from './HRHeader';
import axiosInstance from '../../configs/axios-config';
import { HR_SERVICE } from '../../configs/host-config';
import axios from 'axios';

const departments = [
  { id: 1, name: '마케팅' },
  { id: 2, name: '디자인' },
  { id: 3, name: '인사' },
];

export default function EmployeeRegister() {
  const [email, setEmail] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [departmentId, setDepartmentId] = useState(1);
  const [address, setAddress] = useState('');
  const [position, setPosition] = useState('');
  const [phone, setPhone] = useState('');
  const [memo, setMemo] = useState('');

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      alert('유효하지 않은 이메일 형식입니다!');
      return;
    }
    try {
      await axios.post(`http://localhost:8000${HR_SERVICE}/employees`, {
        email,
        name: employeeName,
        address,
        position,
        departmentId,
        status: 'ACTIVE',
        role: 'EMPLOYEE',
        memo,
      });
      alert('등록 성공!');
    } catch (error) {
      alert(error.response.data.statusMessage);
    }
  };

  return (
    <>
      <HRHeader />
      <div className='register-root'>
        <h2 className='register-title'>신규 등록</h2>

        <form className='register-form' onSubmit={handleSubmit}>
          {/* 이메일 */}
          <label className='reg-label'>이메일</label>
          <div className='reg-email-group'>
            <input
              className='reg-input'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* 2단 배치 필드 */}
          <div className='reg-grid'>
            <div>
              <label className='reg-label'>직원명</label>
              <input
                className='reg-input'
                type='text'
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
              />
            </div>
            <div>
              <label className='reg-label'>부서명</label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
              >
                {departments.map((dept, index) => (
                  <option value={dept.id} key={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className='reg-label'>주소</label>
              <input
                className='reg-input'
                type='text'
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <div>
              <label className='reg-label'>직함/직책</label>
              <input
                className='reg-input'
                type='text'
                value={position}
                onChange={(e) => setPosition(e.target.value)}
              />
            </div>
            <div>
              <label className='reg-label'>핸드폰</label>
              <input
                className='reg-input'
                type='text'
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          {/* 메모 */}
          <label className='reg-label'>메모</label>
          <textarea
            className='reg-input reg-textarea'
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
          />

          {/* 하단 버튼 */}
          <div className='reg-btns'>
            <button type='button' className='btn gray'>
              목록
            </button>
            <button type='submit' className='btn blue'>
              등록
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
