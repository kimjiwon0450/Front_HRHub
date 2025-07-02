import React from 'react';
import './EmployeeDetail.scss';
import HRHeader from './HRHeader';

export default function EmployeeDetail({ employee }) {
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
  return (
    <>
      <div className='emp-detail-root'>
        <div className='emp-detail-main'>
          <div className='emp-profile'>
            <img
              src='https://cdn.imweb.me/thumbnail/20240206/f520d5bdbd28e.jpg'
              alt='profile'
            />
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
                <td></td>
              </tr>
              <tr>
                <th>입사일</th>
                <td>
                  {!employee.hireDate ? null : employee.hireDate.split('T')[0]}
                </td>
                <th>근속년월</th>
                <td></td>
                <th>퇴사일</th>
                <td></td>
              </tr>
              <tr>
                <th>근무부서</th>
                <td colSpan={3}>{employee.department}</td>
                <th>직무/단계</th>
                <td>{employee.position}</td>
              </tr>
              <tr>
                <th>주소</th>
                <td colSpan={3}>{employee.address}</td>
                <th>전화번호</th>
                <td>{employee.phone}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 하단 버튼 */}
        <div className='emp-btns'>
          <button className='btn blue'>직원정보 수정</button>
          <button className='btn blue'>직원정보 삭제</button>
          <button className='btn green'>인사평가</button>
        </div>
      </div>
    </>
  );
}
