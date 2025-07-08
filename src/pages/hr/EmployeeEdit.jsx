import React, { useState, useEffect } from 'react';
import './EmployeeRegister.scss'; // 스타일 재사용!
import HRHeader from './HRHeader';
import axios from 'axios';
import { API_BASE_URL, HR_SERVICE } from '../../configs/host-config';
import axiosInstance from '../../configs/axios-config';
import { useNavigate } from 'react-router-dom';

export default function EmployeeEdit({ employee, onClose }) {
  // 기존 employee prop을 state로 복사 (혹은 useEffect로 세팅)
  const [email, setEmail] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [birth, setBirth] = useState('');
  const [departmentId, setDepartmentId] = useState(1);
  const [address, setAddress] = useState('');
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('');
  const [memo, setMemo] = useState('');
  const [departments, setDepartments] = useState([]);
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [isDeptLoading, setIsDeptLoading] = useState(false);
  const [isNewEmployee, setIsNewEmployee] = useState(true);
  const [hireDate, setHireDate] = useState('');
  const [position, setPosition] = useState(''); // 직급 초기값 설정

  const navigate = useNavigate();

  // mount 시 기존 데이터로 state 초기화
  useEffect(() => {
    if (employee) {
      setEmail(employee.email || '');
      setEmployeeName(employee.name || '');
      setBirth(employee.birthday.split('T')[0] || ''); // API에 따라 birth or birthday
      setDepartmentId(employee.departmentId || 1);
      setAddress(employee.address || '');
      setRole(employee.role || '');
      setPhone(employee.phone || '');
      setPosition(employee.position || ''); // 직급
      setMemo(employee.memo || '');
      setIsNewEmployee(employee.isNewEmployee !== false); // true(신입), false(경력)
      setHireDate(employee.hireDate ? employee.hireDate.split('T')[0] : ''); // 입사일 초기화
    }
  }, [employee]);

  // 부서 목록 불러오기
  const fetchDepartments = async () => {
    try {
      const res = await axiosInstance.get(
        `${API_BASE_URL}${HR_SERVICE}/departments`,
      );
      setDepartments(res.data.result);
    } catch (err) {
      setDepartments([]);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  // 부서 등록 핸들러
  const handleAddDepartment = async () => {
    if (!newDeptName.trim()) {
      alert('부서명을 입력하세요.');
      return;
    }
    setIsDeptLoading(true);
    try {
      const res = await axiosInstance.post(
        `${API_BASE_URL}${HR_SERVICE}/department/add`,
        {
          name: newDeptName,
        },
      );
      alert('부서 등록 성공!');
      setNewDeptName('');
      setShowDeptModal(false);
      fetchDepartments();
    } catch (err) {
      alert(
        err.response?.data?.statusMessage ||
          err.response?.data?.message ||
          '부서 등록 실패',
      );
    } finally {
      setIsDeptLoading(false);
    }
  };

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
    if (!hireDate.trim()) {
      alert('입사일을 입력해주세요.');
      return;
    }
    try {
      await axiosInstance.patch(
        `http://localhost:8000${HR_SERVICE}/employees/${employee.employeeId}`,
        {
          email,
          name: employeeName,
          birthday: birth,
          address,
          departmentId,
          phone,
          status: employee.status || 'ACTIVE',
          role: employee.role,
          position: employee.position,
          memo,
          isNewEmployee,
          hireDate,
        },
      );
      alert('수정 성공!');
      window.location.reload(); // 수정 후 새로고침
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <select
                  className='reg-input'
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  style={{ flex: 1 }}
                >
                  {departments.map((dept) => (
                    <option value={dept.id} key={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
                <button
                  type='button'
                  style={{
                    border: 'none',
                    background: '#e6e6e6',
                    borderRadius: '50%',
                    width: 28,
                    height: 28,
                    fontSize: 20,
                    cursor: 'pointer',
                    marginLeft: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                  }}
                  aria-label='부서 추가'
                  onClick={() => setShowDeptModal(true)}
                >
                  +
                </button>
              </div>
            </div>
            <div>
              <label className='reg-label'>직급</label>
              <select
                className='reg-input'
                value={position}
                onChange={(e) => setPosition(e.target.value)}
              >
                <option value='INTERN'>INTERN</option>
                <option value='JUNIOR'>JUNIOR</option>
                <option value='SENIOR'>SENIOR</option>
                <option value='MANAGER'>MANAGER</option>
                <option value='DIRECTOR'>DIRECTOR</option>
              </select>
            </div>
            <div>
              <label className='reg-label'>직책</label>
              <select
                className='reg-input'
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value='EMPLOYEE'>EMPLOYEE</option>
                <option value='HR_MANAGER'>HR_MANAGER</option>
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
              <label className='reg-label'>핸드폰</label>
              <input
                className='reg-input'
                type='text'
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div>
              <label className='reg-label'>입사일</label>
              <input
                className='reg-input'
                type='date'
                value={hireDate}
                onChange={(e) => setHireDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <label className='reg-label'>입사구분</label>
              <select
                className='reg-input'
                value={isNewEmployee ? '신입' : '경력'}
                onChange={(e) => setIsNewEmployee(e.target.value === '신입')}
              >
                <option value='신입'>신입</option>
                <option value='경력'>경력</option>
              </select>
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
            <button type='button' className='btn gray' onClick={onClose}>
              취소
            </button>
            <button type='submit' className='btn blue'>
              수정
            </button>
          </div>
        </form>
      </div>
      {/* 부서 추가 모달 */}
      {showDeptModal && (
        <div className='dept-modal-overlay'>
          <div className='dept-modal'>
            <h3>부서 추가</h3>
            <input
              className='reg-input'
              value={newDeptName}
              onChange={(e) => setNewDeptName(e.target.value)}
              placeholder='부서명 입력'
              disabled={isDeptLoading}
            />
            <div className='dept-modal-btns'>
              <button
                className='btn blue'
                onClick={handleAddDepartment}
                disabled={isDeptLoading}
              >
                추가
              </button>
              <button
                className='btn gray'
                onClick={() => setShowDeptModal(false)}
                disabled={isDeptLoading}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
