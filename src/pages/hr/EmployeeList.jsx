import React, { useEffect, useState } from 'react';
import EmployeeDetail from './EmployeeDetail';
import HRHeader from './HRHeader';
import './EmployeeList.scss';
import axiosInstance from '../../configs/axios-config';
import { API_BASE_URL, HR_SERVICE } from '../../configs/host-config';

export default function EmployeeList() {
  const [selectedId, setSelectedId] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState({});
  const [employees, setEmployees] = useState([]);
  useEffect(() => {
    getEmployeeList();
  }, []);

  const getEmployeeList = async () => {
    try {
      const res = await axiosInstance.get(
        `${API_BASE_URL}${HR_SERVICE}/employees?page=0&size=10`,
      );
      setEmployees(res.data.result.content);
      console.log(res.data.result);
    } catch (error) {
      alert(error);
    }
  };

  useEffect(() => {
    if (selectedId == null) {
      return;
    }
    getEmployeeDetail(selectedId);
  }, [selectedId]);
  const getEmployeeDetail = async (id) => {
    try {
      const res = await axiosInstance.get(
        `${API_BASE_URL}${HR_SERVICE}/employees/${id}`,
      );

      console.log(res);
      setSelectedDetail({
        ...res.data.result,
        department: employees.find((e) => e.id === selectedId).department,
      });
    } catch (error) {
      alert(error.response.data || '시스템에러');
      console.log(error);
    }
  };

  return (
    <>
      <HRHeader />

      <div className='emp-list-root'>
        <h2 className='emp-list-title'>직원 목록</h2>
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
                <td>{emp.position}</td>
                <td>{emp.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* 하단에 상세 정보 */}
      {selectedId && (
        <div className='emp-detail-below'>
          <EmployeeDetail employee={selectedDetail} />
        </div>
      )}
    </>
  );
}
