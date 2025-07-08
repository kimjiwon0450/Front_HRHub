import React, { useState, useEffect } from 'react';
import './ContactList.scss';
import axiosInstance from '../../configs/axios-config';
import { get } from 'lodash';
import { API_BASE_URL, HR_SERVICE } from '../../configs/host-config';

const dummyEmployees = [
  {
    id: 1,
    name: '홍길동',
    position: '주임',
    role: '팀장', // 예시 직책 추가
    department: '인사팀',
    phone: '010-1234-5678',
    email: 'hongildong@naver.com',
  },
  // ... 여러명 더 추가 가능
];
//// ----------------------------------------------------------------------------------------
const ContactList = () => {
  // const [selectedDept, setSelectedDept] = useState('전체');
  const [searchField, setSearchField] = useState('name');
  const [searchText, setSearchText] = useState('');
  const [sortField, setSortField] = useState('name');

  const [employees, setEmployees] = useState([]);

  // 검색/필터 state
  const [searchDept, setSearchDept] = useState('전체');

  // 페이징 state
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [departmentList, setDepartmentList] = useState([]);

  // //부서 가져오기
  // useEffect(() => {
  //   const getDepartments = async () => {
  //     const res = await axiosInstance.get(
  //       `${API_BASE_URL}${HR_SERVICE}/departments`,
  //     );

  //     if (res.status === 200) {
  //       setDepartmentList(res.data.result);
  //       console.log(res.data.result);
  //     } else {
  //       alert(
  //         res.data.statusMessage || '부서 목록을 가져오는 데 실패했습니다.',
  //       );
  //     }
  //   };
  // }, []);

  // 서버에서 직원 목록 조회 (필터 포함)
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
      console.log(res.data.result.content);
    } catch (error) {
      alert(error?.response?.data?.statusMessage || error.message);
    }
  };
  // getEmployeeList();

  // 부서 필터링
  const filteredEmployees = dummyEmployees.filter(
    (emp) =>
      (searchDept === '전체' || emp.department === searchDept) &&
      (searchText === '' || emp[searchField]?.includes(searchText)),
  );
  // 정렬
  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    if (sortField === 'name') return a.name.localeCompare(b.name);
    if (sortField === 'position') return a.position.localeCompare(b.position);
    if (sortField === 'role') return a.role.localeCompare(b.role);
    return 0;
  });
  // 페이징
  // const totalPages = Math.ceil(sortedEmployees.length / size);
  const pagedEmployees = sortedEmployees.slice((page - 1) * size, page * size);

  return (
    <div className='contact-root'>
      <aside className='contact-org'>
        <h3>조직도</h3>
        <ul>
          <li
            className={searchDept === '전체' ? 'selected' : ''}
            onClick={() => setsearchDept('전체')}
          >
            전체
          </li>
          {departmentList.map((dept) => (
            <li
              key={dept.id}
              className={selectedDept === dept.name ? 'selected' : ''}
              // onClick={() => setSearchDept(dept.name)}
            >
              {dept.name}
            </li>
          ))}
        </ul>
      </aside>
      <section className='contact-main'>
        <form
          className='contact-search'
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
          }}
        >
          <select
            value={searchField}
            onChange={(e) => setSearchField(e.target.value)}
          >
            <option value='name'>이름</option>
            <option value='position'>직급</option>
            <option value='role'>직책</option>
          </select>
          <input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder='검색어 입력'
          />
          <button type='submit'>검색</button>
          <div className='contact-sort'>
            <span>정렬:</span>
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value)}
            >
              <option value='name'>이름순</option>
              <option value='position'>직급순</option>
              <option value='role'>직책순</option>
            </select>
          </div>
        </form>
        <div className='contact-list'>
          {pagedEmployees.map((emp) => (
            <div className='contact-card' key={emp.id}>
              <div className='contact-profile'>프로필사진</div>
              <div className='contact-info'>
                <b>
                  {emp.name} <span>{emp.position}</span> <span>{emp.role}</span>{' '}
                  <span>{emp.department}</span>
                </b>
                <div>{emp.phone}</div>
                <div>{emp.email}</div>
              </div>
            </div>
          ))}
          {pagedEmployees.length === 0 && (
            <div className='no-result'>검색 결과가 없습니다.</div>
          )}
        </div>
        <div className='contact-pagination'>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              className={page === i + 1 ? 'active' : ''}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ContactList;
