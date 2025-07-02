import React, { useState } from 'react';
import './EmployeeRegister.scss';
import HRHeader from './HRHeader';
import axios from 'axios';
import { HR_SERVICE } from '../../configs/host-config';

const departments = [
  { id: 1, name: '마케팅' },
  { id: 2, name: '디자인' },
  { id: 3, name: '인사' },
];

export default function EmployeeRegister() {
  const [email, setEmail] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [birth, setBirth] = useState('');
  const [departmentId, setDepartmentId] = useState(1);
  const [address, setAddress] = useState('');
  const [position, setPosition] = useState('');
  const [phone, setPhone] = useState('');
  const [memo, setMemo] = useState('');

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // 전화번호 형식 검증: 010-1234-5678, 010-123-4567 등
  function isValidPhone(phone) {
    return /^01[016789]-\d{3,4}-\d{4}$/.test(phone);
  }

  function getAge(birth) {
    if (!birth) return '';
    const today = new Date();
    const dob = new Date(birth);
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  }

  // 필수 항목 검증 함수
  function isFormValid() {
    if (
      !email.trim() ||
      !employeeName.trim() ||
      !birth.trim() ||
      !address.trim() ||
      !position.trim() ||
      !phone.trim()
    ) {
      alert('필수 항목을 모두 입력해주세요.');
      return false;
    }
    if (!isValidEmail(email)) {
      alert('유효하지 않은 이메일 형식입니다!');
      return false;
    }
    if (!isValidPhone(phone)) {
      alert('전화번호는 010-1234-5678 형식으로 입력해주세요.');
      return false;
    }
    return true;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) return;

    try {
      await axios.post(`http://localhost:8000${HR_SERVICE}/employees`, {
        email,
        name: employeeName,
        birthday: birth,
        address,
        position,
        departmentId,
        phone,
        status: 'ACTIVE',
        role: 'EMPLOYEE',
        memo,
      });
      alert('등록 성공!');
      // 폼 초기화(선택)
      // setEmail('');
      // setEmployeeName('');
      // setBirth('');
      // setAddress('');
      // setPosition('');
      // setPhone('');
      // setMemo('');
    } catch (error) {
      alert(error.response?.data?.statusMessage || '등록 실패');
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
              placeholder='예: abc@domain.com'
            />
          </div>

          {/* 2단 배치 필드 */}
          <div className='reg-grid'>
            <div>
              <label className='reg-label'>생년월일</label>
              <input
                className='reg-input'
                type='date'
                value={birth}
                onChange={(e) => setBirth(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <label className='reg-label'>나이</label>
              <input
                className='reg-input'
                type='number'
                value={getAge(birth)}
                readOnly
                placeholder='생년월일 선택시 자동계산'
              />
            </div>
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
                {departments.map((dept) => (
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
                placeholder='010-1234-5678'
                maxLength={13}
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
