import React, { useEffect, useState } from 'react';
import EmployeeDetail from './EmployeeDetail';
import EmployeeEdit from './EmployeeEdit';
import EvaluationForm from './EvaluationForm';
import HRHeader from './HRHeader';
import './EmployeeList.scss';
import axiosInstance from '../../configs/axios-config';
import { API_BASE_URL, HR_SERVICE } from '../../configs/host-config';

// 부서 목록을 서버에서 받아옴

export default function EmployeeList() {
  // 'list', 'edit', 'eval' 중 하나
  const [mode, setMode] = useState('list');
  const [selectedId, setSelectedId] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState({});
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);

  // 검색/필터 state
  const [searchField, setSearchField] = useState('name');
  const [searchText, setSearchText] = useState('');
  const [searchDept, setSearchDept] = useState('전체');

  // 페이징 state
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // 정렬 state
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'

  // 서버에서 직원 목록 조회 (필터 포함)
  const getEmployeeList = async ({
    field = searchField,
    keyword = searchText,
    department = searchDept,
    page: reqPage = page,
    size: reqSize = size,
    sortField: reqSortField = sortField,
    sortOrder: reqSortOrder = sortOrder,
  } = {}) => {
    try {
      let params = `?page=${reqPage}&size=${reqSize}`;
      if (keyword.trim())
        params += `&field=${field}&keyword=${encodeURIComponent(keyword)}`;
      if (department !== '전체')
        params += `&department=${encodeURIComponent(department)}`;
      if (reqSortField) params += `&sort=${reqSortField},${reqSortOrder}`;
      const res = await axiosInstance.get(
        `${API_BASE_URL}${HR_SERVICE}/employees${params}`,
      );
      setEmployees(res.data.result.content);
      setTotalPages(res.data.result.totalPages || 1);
    } catch (error) {
      alert(error?.response?.data?.statusMessage || error.message);
    }
  };

  // 정렬 핸들러
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setPage(0); // 정렬 시 첫 페이지로
  };

  // 정렬 상태 변화, 페이지, 페이지 크기 변화 시 목록 재요청
  useEffect(() => {
    getEmployeeList({ page, size, sortField, sortOrder });
    // eslint-disable-next-line
  }, [page, size, sortField, sortOrder]);

  // 직원 선택시 상세 조회
  useEffect(() => {
    if (selectedId == null) return;
    getEmployeeDetail(selectedId);
    // eslint-disable-next-line
  }, [selectedId]);

  // 직원 상세정보 조회
  const getEmployeeDetail = async (id) => {
    try {
      const res = await axiosInstance.get(
        `${API_BASE_URL}${HR_SERVICE}/employees/${id}`,
      );
      setSelectedDetail({
        ...res.data.result,
        department: employees.find((e) => e.id === id)?.department,
      });
    } catch (error) {
      alert(error.response?.data || '시스템에러');
    }
  };

  // 인사평가 존재 여부 확인 후 평가화면 이동
  const handleEvalWithCheck = async () => {
    if (!selectedDetail || !selectedDetail.employeeId) return;
    try {
      await axiosInstance.get(
        `${API_BASE_URL}${HR_SERVICE}/evaluation/${selectedDetail.employeeId}`,
      );
      // 평가가 이미 존재하면 alert만 띄우고 이동하지 않음
      alert('이미 인사평가가 존재합니다.');
    } catch (error) {
      // 평가가 없으면 평가화면으로 이동
      setMode('eval');
    }
  };

  // Edit/Eval 화면 종료 시 목록+상세 복귀
  const handleClose = () => setMode('list');
  const handleEdit = () => setMode('edit');
  const handleEval = () => setMode('eval');

  // 검색 버튼 or 폼 submit시
  const handleSearch = (e) => {
    e.preventDefault();
    getEmployeeList({
      field: searchField,
      keyword: searchText,
      department: searchDept,
    });
    setSelectedId(null); // 검색하면 상세 닫기
  };

  // 초기화
  const handleReset = () => {
    setSearchField('name');
    setSearchText('');
    setSearchDept('전체');
    getEmployeeList({ field: 'name', keyword: '', department: '전체' });
    setSelectedId(null);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
    }
  };

  // 부서 목록 불러오기
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

  // 수정/평가 화면 분기
  if (mode === 'edit')
    return <EmployeeEdit employee={selectedDetail} onClose={handleClose} />;
  if (mode === 'eval')
    return <EvaluationForm employee={selectedDetail} onClose={handleClose} />;

  // 기본(리스트/상세)
  return (
    <>
      <HRHeader />
      <div className='emp-list-root'>
        <h2 className='emp-list-title'>직원 목록</h2>
        {/* 검색/필터 영역 */}
        <form className='emp-search-bar' onSubmit={handleSearch}>
          <select
            value={searchField}
            onChange={(e) => setSearchField(e.target.value)}
            className='emp-search-select'
          >
            <option value='name'>이름</option>
            <option value='department'>부서</option>
            <option value='position'>직급</option>
            <option value='role'>직책</option>
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
              <th
                onClick={() => handleSort('name')}
                style={{ cursor: 'pointer' }}
              >
                이름{' '}
                {sortField === 'name' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th
                onClick={() => handleSort('department')}
                style={{ cursor: 'pointer' }}
              >
                부서{' '}
                {sortField === 'department'
                  ? sortOrder === 'asc'
                    ? '▲'
                    : '▼'
                  : ''}
              </th>
              <th
                onClick={() => handleSort('position')}
                style={{ cursor: 'pointer' }}
              >
                직급{' '}
                {sortField === 'position'
                  ? sortOrder === 'asc'
                    ? '▲'
                    : '▼'
                  : ''}
              </th>
              <th
                onClick={() => handleSort('role')}
                style={{ cursor: 'pointer' }}
              >
                직책{' '}
                {sortField === 'role' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th
                onClick={() => handleSort('phone')}
                style={{ cursor: 'pointer' }}
              >
                연락처{' '}
                {sortField === 'phone' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
              </th>
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
                <td>{emp.position}</td>
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
      </div>
      {/* 상세 정보는 선택 시 하단에만 노출 */}
      {selectedId && (
        <div className='emp-detail-below'>
          <EmployeeDetail
            employee={selectedDetail}
            onEdit={handleEdit}
            onEval={handleEvalWithCheck}
            onClose={handleClose}
          />
        </div>
      )}
    </>
  );
}
