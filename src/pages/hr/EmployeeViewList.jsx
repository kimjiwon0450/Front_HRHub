import React, { useEffect, useState } from 'react';
import HRHeader from './HRHeader';
import './EmployeeList.scss';
import axiosInstance from '../../configs/axios-config';
import { API_BASE_URL, HR_SERVICE } from '../../configs/host-config';
import EvaluationView from './EvaluationView';
import EvaluationForm from './EvaluationForm';

function EmployeeView({ employee, onClose, onEvaluate }) {
  if (!employee) return null;
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
      <div className='emp-btns'>
        <button className='btn primary' onClick={() => onEvaluate(employee)}>
          평가하기
        </button>
        <button className='btn gray' onClick={onClose}>
          닫기
        </button>
      </div>
    </div>
  );
}

export default function EmployeeViewList() {
  const [selectedId, setSelectedId] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState({});
  const [employees, setEmployees] = useState([]);
  const [searchField, setSearchField] = useState('name');
  const [searchText, setSearchText] = useState('');
  const [searchDept, setSearchDept] = useState('전체');
  const [evaluation, setEvaluation] = useState(null);
  const [showEvaluationForm, setShowEvaluationForm] = useState(false);
  const DEPT_LIST = ['전체', '마케팅', '디자인', '인사'];

  const getEmployeeList = async ({
    field = searchField,
    keyword = searchText,
    department = searchDept,
    page = 0,
    size = 100,
  } = {}) => {
    try {
      let params = `?page=${page}&size=${size}`;
      if (keyword.trim())
        params += `&field=${field}&keyword=${encodeURIComponent(keyword)}`;
      if (department !== '전체')
        params += `&department=${encodeURIComponent(department)}`;
      const res = await axiosInstance.get(
        `${API_BASE_URL}${HR_SERVICE}/employees${params}`,
      );
      setEmployees(res.data.result.content);
    } catch (error) {
      alert(error?.response?.data?.statusMessage || error.message);
    }
  };

  useEffect(() => {
    getEmployeeList();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (selectedId == null) return;
    getEmployeeDetail(selectedId);
    getLatestEvaluation(selectedId);
    // eslint-disable-next-line
  }, [selectedId]);

  const getEmployeeDetail = async (id) => {
    try {
      const res = await axiosInstance.get(
        `${API_BASE_URL}${HR_SERVICE}/employees/${id}`,
      );
      setSelectedDetail(res.data.result);
    } catch (error) {
      alert(error.response?.data || '시스템에러');
    }
  };

  // 최신 인사평가 불러오기 (예시: /hr-service/evaluations/latest/{employeeId})
  const getLatestEvaluation = async (id) => {
    try {
      const res = await axiosInstance.get(
        `${API_BASE_URL}${HR_SERVICE}/evaluations/latest/${id}`,
      );
      setEvaluation(res.data.result);
    } catch (error) {
      setEvaluation(null);
      alert('인사평가 내역이 없습니다.');
    }
  };

  const handleClose = () => {
    setSelectedId(null);
    setEvaluation(null);
    setShowEvaluationForm(false);
  };

  const handleEvaluate = (employee) => {
    setShowEvaluationForm(true);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    getEmployeeList({
      field: searchField,
      keyword: searchText,
      department: searchDept,
    });
    setSelectedId(null);
    setEvaluation(null);
  };

  const handleReset = () => {
    setSearchField('name');
    setSearchText('');
    setSearchDept('전체');
    getEmployeeList({ field: 'name', keyword: '', department: '전체' });
    setSelectedId(null);
    setEvaluation(null);
  };

  return (
    <>
      <HRHeader />
      <div className='emp-list-root'>
        <h2 className='emp-list-title'>직원 인사조회</h2>
        <form className='emp-search-bar' onSubmit={handleSearch}>
          <select
            value={searchField}
            onChange={(e) => setSearchField(e.target.value)}
            className='emp-search-select'
          >
            <option value='name'>이름</option>
            <option value='department'>부서</option>
            <option value='position'>직급</option>
            <option value='phone'>연락처</option>
          </select>
          <input
            type='text'
            className='emp-search-input'
            placeholder='검색어 입력'
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <select
            value={searchDept}
            onChange={(e) => setSearchDept(e.target.value)}
            className='emp-search-dept'
          >
            {DEPT_LIST.map((dept) => (
              <option value={dept} key={dept}>
                {dept}
              </option>
            ))}
          </select>
          <button type='submit' className='emp-search-btn'>
            검색
          </button>
          <button
            type='button'
            className='emp-search-clear'
            onClick={handleReset}
          >
            초기화
          </button>
        </form>
        <table className='emp-list-table'>
          <thead>
            <tr>
              <th>이름</th>
              <th>부서</th>
              <th>직급</th>
              <th>연락처</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr
                key={emp.id}
                onClick={() => setSelectedId(emp.id)}
                className={selectedId === emp.id ? 'selected' : ''}
                style={{ cursor: 'pointer' }}
              >
                <td>{emp.name}</td>
                <td>{emp.department}</td>
                <td>{emp.role}</td>
                <td>{emp.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {selectedId && !showEvaluationForm && (
          <EmployeeView
            employee={selectedDetail}
            onClose={handleClose}
            onEvaluate={handleEvaluate}
          />
        )}
        {selectedId && evaluation && !showEvaluationForm && (
          <EvaluationView evaluation={evaluation} onClose={handleClose} />
        )}
        {showEvaluationForm && (
          <EvaluationForm employee={selectedDetail} onClose={handleClose} />
        )}
      </div>
    </>
  );
}
