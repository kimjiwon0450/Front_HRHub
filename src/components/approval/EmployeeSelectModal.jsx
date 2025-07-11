import React, { useState, useEffect } from 'react';
import styles from './EmployeeSelectModal.module.scss';
import axiosInstance from '../../configs/axios-config';
import { API_BASE_URL, HR_SERVICE } from '../../configs/host-config';

const EmployeeSelectModal = ({
  open,
  onClose,
  onSelect,
  selectedEmployees,
  multiple,
}) => {
  const [departmentList, setDepartmentList] = useState([]);
  const [employeeList, setEmployeeList] = useState([]);
  const [selected, setSelected] = useState(selectedEmployees || []);
  const [activeTab, setActiveTab] = useState('전체');
  const [openDept, setOpenDept] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const getDepartmentList = async () => {
    try {
      const res = await axiosInstance.get(
        `${API_BASE_URL}${HR_SERVICE}/departments`,
      );
      if (res.status === 200) setDepartmentList(res.data.result);
    } catch (err) {
      setError('부서 정보를 불러오지 못했습니다.');
    }
  };

  const getEmployeeList = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get(
        `${API_BASE_URL}${HR_SERVICE}/employees?size=9999`,
      );
      if (res.status === 200) setEmployeeList(res.data.result.content);
    } catch (err) {
      setError('직원 정보를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getDepartmentList();
    getEmployeeList();
  }, []);

  useEffect(() => {
    setSelected(selectedEmployees || []);
  }, [selectedEmployees]);

  // 검색 필터링
  const filteredEmployees = employeeList.filter((emp) => {
    const keyword = search.trim();
    if (!keyword) return true;
    return (
      emp.name.includes(keyword) ||
      emp.department?.includes(keyword) ||
      emp.position?.includes(keyword) ||
      emp.role?.includes(keyword)
    );
  });

  // 팀별로 직원 그룹핑 (검색 적용)
  const employeesByDept = departmentList.reduce((acc, dept) => {
    acc[dept.name] = filteredEmployees.filter(
      (emp) => emp.department === dept.name,
    );
    return acc;
  }, {});

  const handleSelect = (emp) => {
    if (multiple) {
      setSelected((prev) =>
        prev.some((e) => e.id === emp.id)
          ? prev.filter((e) => e.id !== emp.id)
          : [...prev, emp],
      );
    } else {
      setSelected([emp]);
    }
  };

  if (!open) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modalContainer}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className={styles.modalTitle}>직원 선택</h3>
        <input
          type='text'
          placeholder='이름/부서/직급/직책 검색'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />
        <div className={styles.tabGroup}>
          <button
            className={activeTab === '전체' ? styles.activeTab : styles.tab}
            onClick={() => setActiveTab('전체')}
            type='button'
          >
            전체
          </button>
          <button
            className={activeTab === '팀별' ? styles.activeTab : styles.tab}
            onClick={() => setActiveTab('팀별')}
            type='button'
          >
            팀별
          </button>
        </div>
        {loading && <div className={styles.loading}>로딩 중...</div>}
        {error && <div className={styles.error}>{error}</div>}
        {!loading && !error && activeTab === '전체' && (
          <ul className={styles.employeeList}>
            {filteredEmployees.map((emp) => (
              <li key={emp.id} className={styles.employeeItem}>
                <label className={styles.employeeLabel}>
                  <input
                    type={multiple ? 'checkbox' : 'radio'}
                    checked={selected.some((e) => e.id === emp.id)}
                    onChange={() => handleSelect(emp)}
                    className={styles.employeeInput}
                  />
                  <span className={styles.employeeInfo}>
                    <b>{emp.name}</b>{' '}
                    <span className={styles.employeeMeta}>
                      ({emp.position} / {emp.role} / {emp.department})
                    </span>
                  </span>
                </label>
              </li>
            ))}
            {filteredEmployees.length === 0 && (
              <li className={styles.noResult}>검색 결과가 없습니다.</li>
            )}
          </ul>
        )}
        {!loading && !error && activeTab === '팀별' && (
          <div className={styles.departmentList}>
            {departmentList.map((dept) => (
              <div key={dept.id} className={styles.departmentItem}>
                <div
                  className={styles.departmentHeader}
                  onClick={() =>
                    setOpenDept(openDept === dept.id ? null : dept.id)
                  }
                >
                  {dept.name}{' '}
                  <span className={styles.departmentCount}>
                    ({employeesByDept[dept.name]?.length || 0}명)
                  </span>
                  <span className={styles.departmentArrow}>
                    {openDept === dept.id ? '▲' : '▼'}
                  </span>
                </div>
                {openDept === dept.id && (
                  <ul className={styles.departmentEmployeeList}>
                    {employeesByDept[dept.name].map((emp) => (
                      <li key={emp.id} className={styles.employeeItem}>
                        <label className={styles.employeeLabel}>
                          <input
                            type={multiple ? 'checkbox' : 'radio'}
                            checked={selected.some((e) => e.id === emp.id)}
                            onChange={() => handleSelect(emp)}
                            className={styles.employeeInput}
                          />
                          <span className={styles.employeeInfo}>
                            <b>{emp.name}</b>{' '}
                            <span className={styles.employeeMeta}>
                              ({emp.position} / {emp.role})
                            </span>
                          </span>
                        </label>
                      </li>
                    ))}
                    {employeesByDept[dept.name].length === 0 && (
                      <li className={styles.noResult}>검색 결과가 없습니다.</li>
                    )}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
        <div className={styles.buttonGroup}>
          <button
            onClick={() => {
              onSelect(selected);
              onClose();
            }}
            className={styles.confirmButton}
            type='button'
          >
            확인
          </button>
          <button
            onClick={onClose}
            className={styles.cancelButton}
            type='button'
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeSelectModal;
