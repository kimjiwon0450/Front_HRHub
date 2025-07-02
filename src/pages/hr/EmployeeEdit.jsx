import React, { useState, useEffect } from 'react';
import './EmployeeRegister.scss'; // 스타일 재사용!
import HRHeader from './HRHeader';
import axios from 'axios';
import { HR_SERVICE } from '../../configs/host-config';
import axiosInstance from '../../configs/axios-config';

// 부서 목록은 상위에서 받아올 수도 있고, 아래처럼 고정할 수도 있음
const departments = [
  { id: 1, name: '마케팅' },
  { id: 2, name: '디자인' },
  { id: 3, name: '인사' },
];

export default function EmployeeEdit({ employee }) {
  // 기존 employee prop을 state로 복사 (혹은 useEffect로 세팅)
  const [email, setEmail] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [birth, setBirth] = useState('');
  const [departmentId, setDepartmentId] = useState(1);
  const [address, setAddress] = useState('');
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('');
  const [memo, setMemo] = useState('');

  // mount 시 기존 데이터로 state 초기화
  useEffect(() => {
    if (employee) {
      setEmail(employee.email || '');
      setEmployeeName(employee.name || '');
      setBirth(employee.birthday || ''); // API에 따라 birth or birthday
      setDepartmentId(employee.departmentId || 1);
      setAddress(employee.address || '');
      setRole(employee.role || '');
      setPhone(employee.phone || '');
      setMemo(employee.memo || '');
    }
  }, [employee]);

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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

  // 수정 제출
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      alert('유효하지 않은 이메일 형식입니다!');
      return;
    }
    try {
      await axiosInstance.patch(
        `http://localhost:8000${HR_SERVICE}/employees/${employee.id}`, // id 필요!
        {
          email,
          name: employeeName,
          birthday: birth,
          address,
          role,
          departmentId,
          phone,
          status: employee.status || 'ACTIVE', // 필요에 따라 수정
          role: employee.role || 'EMPLOYEE',
          memo,
        },
      );
      alert('수정 성공!');
    } catch (error) {
      alert(error?.response?.data?.statusMessage || error.message);
    }
  };

  return (
    <>
      <HRHeader />
      <div className='register-root'>
        <h2 className='register-title'>정보 수정</h2>

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
                value={role}
                onChange={(e) => setRole(e.target.value)}
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
            <button
              type='button'
              className='btn gray'
              onClick={() => window.history.back()}
            >
              취소
            </button>
            <button type='submit' className='btn blue'>
              수정
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
