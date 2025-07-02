import React, { useEffect, useState } from 'react';
import EmployeeDetail from './EmployeeDetail';
import EmployeeEdit from './EmployeeEdit';
import EvaluationForm from './EvaluationForm';
import HRHeader from './HRHeader';
import './EmployeeList.scss';
import axiosInstance from '../../configs/axios-config';
import { API_BASE_URL, HR_SERVICE } from '../../configs/host-config';

export default function EmployeeList() {
  // 'list', 'edit', 'eval' 중 하나
  const [mode, setMode] = useState('list');
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
    } catch (error) {
      alert(error);
    }
  };

  // 상세정보 fetch
  useEffect(() => {
    if (selectedId == null) return;
    getEmployeeDetail(selectedId);
  }, [selectedId]);

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

  // Edit/Eval 화면 종료 시 목록+상세 복귀
  const handleClose = () => setMode('list');

  // 상세 하단 버튼에서 넘겨줄 핸들러
  const handleEdit = () => setMode('edit');
  const handleEval = () => setMode('eval');

  // 수정/평가 화면만 보여줄 때
  if (mode === 'edit') {
    return <EmployeeEdit employee={selectedDetail} onClose={handleClose} />;
  }
  if (mode === 'eval') {
    return <EvaluationForm employee={selectedDetail} onClose={handleClose} />;
  }

  // 기본: 리스트+디테일(선택시)
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
                <td>{emp.role}</td>
                <td>{emp.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* 상세 정보는 선택 시 하단에만 노출 */}
      {selectedId && (
        <div className='emp-detail-below'>
          <EmployeeDetail
            employee={selectedDetail}
            onEdit={handleEdit}
            onEval={handleEval}
          />
        </div>
      )}
    </>
  );
}
