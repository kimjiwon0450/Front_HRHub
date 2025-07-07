import React, { useEffect, useState } from 'react';
import HRHeader from './HRHeader';
import './EmployeeList.scss';
import axiosInstance from '../../configs/axios-config';
import { API_BASE_URL, HR_SERVICE } from '../../configs/host-config';
import EvaluationView from './EvaluationView';
import EvaluationForm from './EvaluationForm';

export default function EmployeeViewList() {
  const [selectedId, setSelectedId] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState({});
  const [employees, setEmployees] = useState([]);
  const [searchField, setSearchField] = useState('name');
  const [searchText, setSearchText] = useState('');
  const [searchDept, setSearchDept] = useState('전체');
  const [evaluation, setEvaluation] = useState(null);
  const [showEvaluationForm, setShowEvaluationForm] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const getEmployeeList = async ({
    field = searchField,
    keyword = searchText,
    department = searchDept,
    page: reqPage = page,
    size: reqSize = size,
  } = {}) => {
    try {
      let params = `?page=${reqPage}&size=${reqSize}`;
      if (keyword.trim())
        params += `&field=${field}&keyword=${encodeURIComponent(keyword)}`;
      if (department !== '전체')
        params += `&department=${encodeURIComponent(department)}`;
      const res = await axiosInstance.get(
        `${API_BASE_URL}${HR_SERVICE}/employees${params}`,
      );
      setEmployees(res.data.result.content);
      setTotalPages(res.data.result.totalPages || 1);
    } catch (error) {
      alert(error?.response?.data?.statusMessage || error.message);
    }
  };

  useEffect(() => {
    getEmployeeList({ page, size });
    // eslint-disable-next-line
  }, [page, size]);

  useEffect(() => {
    if (selectedId == null) return;
    getLatestEvaluation(selectedId);
    // eslint-disable-next-line
  }, [selectedId]);

  useEffect(() => {
    async function fetchDepartments() {
      try {
        const res = await axiosInstance.get(
          `${API_BASE_URL}${HR_SERVICE}/departments`,
        );
        setDepartments(res.data.result || []);
      } catch (err) {
        setDepartments([]);
      }
    }
    fetchDepartments();
  }, []);

  // 최신 인사평가 불러오기 (예시: /hr-service/evaluations/latest/{employeeId})
  const getLatestEvaluation = async (id) => {
    try {
      const res = await axiosInstance.get(
        `${API_BASE_URL}${HR_SERVICE}/evaluation/${id}`,
      );
      setEvaluation(res.data.result);
    } catch (error) {
      setEvaluation(null);
      alert('인사평가 정보가 없습니다.');
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

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
    }
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
            <option value='전체'>전체</option>
            {departments.map((dept) => (
              <option value={dept.name} key={dept.id}>
                {dept.name}
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
        {/* 페이징 UI */}
        <div
          className='pagination'
          style={{ margin: '1rem 0', textAlign: 'center' }}
        >
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 0}
          >
            이전
          </button>
          {Array.from({ length: totalPages }, (_, idx) => (
            <button
              key={idx}
              onClick={() => handlePageChange(idx)}
              style={{ fontWeight: page === idx ? 'bold' : 'normal' }}
            >
              {idx + 1}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages - 1}
          >
            다음
          </button>
        </div>
        {selectedId && !showEvaluationForm && evaluation && (
          <EvaluationView evaluation={evaluation} onClose={handleClose} />
        )}
        {showEvaluationForm && (
          <EvaluationForm employee={selectedDetail} onClose={handleClose} />
        )}
      </div>
    </>
  );
}
