import React, { useState, useEffect } from 'react';
import './EmployeeDetail.scss';
import HRHeader from './HRHeader';
import EmployeeEdit from './EmployeeEdit';
import EvaluationForm from './EvaluationForm';
import axiosInstance from '../../configs/axios-config';
import { API_BASE_URL, HR_SERVICE } from '../../configs/host-config';

export default function EmployeeDetail({ employee, onEval, onEdit, onClose }) {
  const [showEdit, setShowEdit] = useState(false);
  const [showEval, setShowEval] = useState(false);
  const [localEmployee, setLocalEmployee] = useState(employee);

  useEffect(() => {
    setLocalEmployee(employee);
  }, [employee]);

  console.log(employee);
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

  // 근속년월 계산 함수
  function getServicePeriod(hireDate) {
    if (!hireDate) return '';
    const start = new Date(hireDate);
    const end = new Date();
    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }
    return `${years}년 ${months}개월 ${days}일`;
  }

  // 직원 삭제 함수
  const handleDelete = async () => {
    if (!window.confirm('정말로 이 직원을 삭제하시겠습니까?')) return;
    try {
      const res = await axiosInstance.patch(
        `${API_BASE_URL}${HR_SERVICE}/employee/${employee.employeeId}/retire`,
      );
      alert('직원이 퇴사처리 되었습니다.');
      setLocalEmployee((prev) => ({
        ...prev,
        status: 'INACTIVE',
        retireDate: new Date().toISOString(), // 또는 res.data.retireDate
      }));
    } catch (error) {
      alert('퇴사처리에 실패하였습니다.');
      console.error(error);
    }
  };

  // 두 컴포넌트 중 하나라도 활성화되면 해당 컴포넌트만 표시
  if (showEdit) {
    return (
      <EmployeeEdit employee={employee} onClose={() => setShowEdit(false)} />
    );
  }
  if (showEval) {
    return (
      <EvaluationForm employee={employee} onClose={() => setShowEval(false)} />
    );
  }

  return (
    <>
      <div className='emp-detail-root'>
        <div className='emp-detail-main'>
          <div className='emp-profile'>
            <img src={employee.profileImageUri} alt='profile' />
          </div>
          <table className='emp-info-table'>
            <tbody>
              <tr>
                <th>이름</th>
                <td>{employee.name}</td>
                <th>생년월일</th>
                <td>
                  {!employee.birthday ? null : employee.birthday.split('T')[0]}
                </td>
                <th>나이</th>
                <td>{getAge(employee?.birthday)}</td>
              </tr>
              <tr>
                <th>사번</th>
                <td>{employee.employeeId}</td>
                <th>재직상태</th>
                <td>{employee.status}</td>
                <th>입사구분</th>
                <td>{employee.isNewEmployee ? '신입' : '경력'}</td>
              </tr>
              <tr>
                <th>입사일</th>
                <td>
                  {!employee.hireDate ? null : employee.hireDate.split('T')[0]}
                </td>
                <th>근속년월</th>
                <td>{getServicePeriod(employee.hireDate)}</td>
                <th>퇴사일</th>
                <td>
                  {localEmployee.retireDate
                    ? localEmployee.retireDate.split('T')[0]
                    : ''}
                </td>
              </tr>
              <tr>
                <th>근무부서</th>
                <td colSpan={3}>{employee.department}</td>
                <th>직무/단계</th>
                <td>{employee.role}</td>
              </tr>
              <tr>
                <th>주소</th>
                <td colSpan={3}>{employee.address}</td>
                <th>전화번호</th>
                <td>{employee.phone}</td>
              </tr>
              <tr>
                <th>이메일</th>
                <td colSpan={5}>{employee.email}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 하단 버튼 */}
        <div className='emp-btns'>
          <button className='btn blue' onClick={onEdit}>
            직원정보 수정
          </button>
          {localEmployee.status !== 'INACTIVE' && (
            <>
              <button className='btn blue' onClick={handleDelete}>
                직원정보 삭제
              </button>
              <button className='btn green' onClick={onEval}>
                인사평가
              </button>
            </>
          )}
          <button className='btn gray' onClick={onClose}>
            목록
          </button>
        </div>
      </div>
    </>
  );
}
