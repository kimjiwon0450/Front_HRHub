import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axiosInstance from '../../configs/axios-config';
import { API_BASE_URL, APPROVAL_SERVICE } from '../../configs/host-config';
import styles from './ApprovalForm.module.scss';

// (1) 직원 선택 모달 임시 컴포넌트
const EmployeeSelectModal = ({
  open,
  onClose,
  onSelect,
  selectedEmployees,
  multiple,
}) => {
  const [departmentList, setDepartmentList] = useState([
    { id: 1, name: '개발팀' },
    { id: 2, name: '영업팀' },
    { id: 3, name: '인사팀' },
  ]); // 실제로는 API로 불러와야 함
  const [employeeList, setEmployeeList] = useState([
    {
      id: '1001',
      name: '홍길동',
      position: '대리',
      role: '프론트엔드',
      department: '개발팀',
    },
    {
      id: '1002',
      name: '김철수',
      position: '과장',
      role: '백엔드',
      department: '개발팀',
    },
    {
      id: '1003',
      name: '이영희',
      position: '사원',
      role: '영업',
      department: '영업팀',
    },
    {
      id: '1004',
      name: '박민수',
      position: '차장',
      role: '인사',
      department: '인사팀',
    },
    {
      id: '1005',
      name: '최수정',
      position: '사원',
      role: '영업',
      department: '영업팀',
    },
    {
      id: '1006',
      name: '정우성',
      position: '부장',
      role: '팀장',
      department: '개발팀',
    },
  ]); // 실제로는 API로 불러와야 함
  const [selected, setSelected] = useState(selectedEmployees || []);
  const [activeTab, setActiveTab] = useState('전체'); // '전체' or '팀별'
  const [openDept, setOpenDept] = useState(null); // 아코디언 오픈 상태

  useEffect(() => {
    setSelected(selectedEmployees || []);
  }, [selectedEmployees]);

  // 팀별로 직원 그룹핑
  const employeesByDept = departmentList.reduce((acc, dept) => {
    acc[dept.name] = employeeList.filter((emp) => emp.department === dept.name);
    return acc;
  }, {});

  // 전체 직원
  const allEmployees = employeeList;

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

  return open ? (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.35)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff',
          minWidth: 360,
          maxWidth: 480,
          width: '90%',
          borderRadius: 16,
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          padding: '32px 28px 24px 28px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          style={{
            margin: 0,
            marginBottom: 18,
            fontSize: 22,
            fontWeight: 700,
            color: '#222',
            textAlign: 'center',
          }}
        >
          직원 선택
        </h3>
        {/* 탭 */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
          <button
            style={{
              flex: 1,
              background: activeTab === '전체' ? '#1976d2' : '#e3e8ef',
              color: activeTab === '전체' ? '#fff' : '#222',
              border: 'none',
              borderRadius: '16px',
              height: '32px',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: 15,
              transition: 'background 0.2s',
            }}
            onClick={() => setActiveTab('전체')}
          >
            전체
          </button>
          <button
            style={{
              flex: 1,
              background: activeTab === '팀별' ? '#1976d2' : '#e3e8ef',
              color: activeTab === '팀별' ? '#fff' : '#222',
              border: 'none',
              borderRadius: '16px',
              height: '32px',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: 15,
              transition: 'background 0.2s',
            }}
            onClick={() => setActiveTab('팀별')}
          >
            팀별
          </button>
        </div>
        {/* 전체 탭 */}
        {activeTab === '전체' && (
          <ul
            style={{
              maxHeight: 260,
              overflowY: 'auto',
              padding: 0,
              margin: 0,
              marginBottom: 18,
            }}
          >
            {allEmployees.map((emp) => (
              <li
                key={emp.id}
                style={{
                  listStyle: 'none',
                  marginBottom: 10,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    cursor: 'pointer',
                    fontSize: 16,
                    color: '#333',
                    width: '100%',
                  }}
                >
                  <input
                    type={multiple ? 'checkbox' : 'radio'}
                    checked={selected.some((e) => e.id === emp.id)}
                    onChange={() => handleSelect(emp)}
                    style={{
                      accentColor: '#1976d2',
                      width: 18,
                      height: 18,
                      margin: 0,
                    }}
                  />
                  <span style={{ flex: 1 }}>
                    <b>{emp.name}</b>{' '}
                    <span style={{ color: '#888', fontSize: 14 }}>
                      ({emp.position} / {emp.role} / {emp.department})
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        )}
        {/* 팀별 탭 */}
        {activeTab === '팀별' && (
          <div style={{ maxHeight: 260, overflowY: 'auto', marginBottom: 18 }}>
            {departmentList.map((dept) => (
              <div
                key={dept.id}
                style={{
                  marginBottom: 10,
                  border: '1px solid #e3e8ef',
                  borderRadius: 10,
                  background: '#f8fafc',
                }}
              >
                <div
                  style={{
                    padding: '10px 16px',
                    fontWeight: 600,
                    fontSize: 16,
                    color: '#1976d2',
                    cursor: 'pointer',
                    borderRadius: 10,
                  }}
                  onClick={() =>
                    setOpenDept(openDept === dept.id ? null : dept.id)
                  }
                >
                  {dept.name}{' '}
                  <span
                    style={{ color: '#888', fontWeight: 400, fontSize: 14 }}
                  >
                    ({employeesByDept[dept.name]?.length || 0}명)
                  </span>
                  <span style={{ float: 'right', fontSize: 18 }}>
                    {openDept === dept.id ? '▲' : '▼'}
                  </span>
                </div>
                {openDept === dept.id && (
                  <ul
                    style={{
                      maxHeight: 140,
                      overflowY: 'auto',
                      margin: 0,
                      padding: '0 0 0 8px',
                    }}
                  >
                    {employeesByDept[dept.name].map((emp) => (
                      <li
                        key={emp.id}
                        style={{
                          listStyle: 'none',
                          marginBottom: 8,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        <label
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            cursor: 'pointer',
                            fontSize: 16,
                            color: '#333',
                            width: '100%',
                          }}
                        >
                          <input
                            type={multiple ? 'checkbox' : 'radio'}
                            checked={selected.some((e) => e.id === emp.id)}
                            onChange={() => handleSelect(emp)}
                            style={{
                              accentColor: '#1976d2',
                              width: 18,
                              height: 18,
                              margin: 0,
                            }}
                          />
                          <span style={{ flex: 1 }}>
                            <b>{emp.name}</b>{' '}
                            <span style={{ color: '#888', fontSize: 14 }}>
                              ({emp.position} / {emp.role})
                            </span>
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button
            onClick={() => {
              onSelect(selected);
              onClose();
            }}
            style={{
              background: '#1976d2',
              color: '#fff',
              border: 'none',
              borderRadius: '16px',
              height: '32px',
              padding: '0 20px',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: 15,
              transition: 'background 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = '#1565c0')}
            onMouseOut={(e) => (e.currentTarget.style.background = '#1976d2')}
          >
            확인
          </button>
          <button
            onClick={onClose}
            style={{
              background: '#e3e8ef',
              color: '#222',
              border: 'none',
              borderRadius: '16px',
              height: '32px',
              padding: '0 20px',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: 15,
              transition: 'background 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = '#cfd8dc')}
            onMouseOut={(e) => (e.currentTarget.style.background = '#e3e8ef')}
          >
            취소
          </button>
        </div>
      </div>
    </div>
  ) : null;
};

const ApprovalForm = () => {
  const navigate = useNavigate();
  const { reportId } = useParams();
  const location = useLocation();

  const isEditMode = reportId && location.pathname.includes('/edit/');
  const isResubmitMode = reportId && location.pathname.includes('/resubmit/');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  // (2) approvers/references를 배열로 관리
  const [approvers, setApprovers] = useState([]); // [{id, name}]
  const [references, setReferences] = useState([]); // [{id, name}]
  const [showApproverModal, setShowApproverModal] = useState(false);
  const [showReferenceModal, setShowReferenceModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    if (reportId) {
      // 수정 또는 재상신 모드일 때
      const fetchReportData = async () => {
        try {
          const res = await axiosInstance.get(
            `${API_BASE_URL}${APPROVAL_SERVICE}/reports/${reportId}`,
          );
          const report = res.data.result;
          setTitle(report.title);
          setContent(report.content);
          setApprovers(
            report.approvalLine.map((a) => ({
              id: a.employeeId,
              name: a.employeeName,
            })),
          );
          setReferences(
            report.references.map((r) => ({
              id: r.employeeId,
              name: r.employeeName,
            })),
          );
        } catch (err) {
          setError('보고서 정보를 불러오는 데 실패했습니다.');
        }
      };
      fetchReportData();
    }
  }, [reportId]);

  // '임시 저장' 또는 '수정하기' (상태: DRAFT)
  const handleSaveOrUpdateDraft = async () => {
    if (!title) {
      alert('제목을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload = {
      title,
      content,
      approvalLine: approvers.map((a) => ({ employeeId: a.id })),
      references: references.map((a) => a.id),
    };

    try {
      if (isEditMode) {
        await axiosInstance.put(
          `${API_BASE_URL}${APPROVAL_SERVICE}/reports/${reportId}`,
          payload,
        );
        alert('수정되었습니다.');
      } else {
        await axiosInstance.post(
          `${API_BASE_URL}${APPROVAL_SERVICE}/create`,
          payload,
        );
        alert('임시 저장되었습니다.');
      }
      navigate('/approval/drafts');
    } catch (err) {
      setError(err.response?.data?.message || '처리 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // '상신하기' (상태: IN_PROGRESS)
  const handleSubmitForApproval = async () => {
    if (!window.confirm('상신하시겠습니까? 상신 후에는 수정할 수 없습니다.')) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload = {
      title,
      content,
      approvalLine: approvers.map((a) => ({ employeeId: a.id })),
      references: references.map((a) => a.id),
      reportStatus: 'IN_PROGRESS', // 상신 상태로 변경
    };

    try {
      await axiosInstance.put(
        `${API_BASE_URL}${APPROVAL_SERVICE}/reports/${reportId}`,
        payload,
      );
      alert('성공적으로 상신되었습니다.');
      navigate('/approval/drafts');
    } catch (err) {
      setError(err.response?.data?.message || '상신 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResubmit = async () => {
    if (!window.confirm('이 내용으로 재상신하시겠습니까?')) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload = {
      newTitle: title,
      newContent: content,
      approvalLine: approvers.map((a) => ({ employeeId: a.id })),
      references: references.map((a) => ({ employeeId: a.id })),
    };

    try {
      await axiosInstance.post(
        `${API_BASE_URL}${APPROVAL_SERVICE}/reports/${reportId}/resubmit`,
        payload,
      );
      alert('성공적으로 재상신되었습니다.');
      navigate('/approval/drafts');
    } catch (err) {
      setError(err.response?.data?.message || '재상신 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPageTitle = () => {
    if (isResubmitMode) return '기안서 재상신';
    if (isEditMode) return '기안서 수정';
    return '기안서 작성';
  };

  return (
    <div className={styles.container}>
      <h2>{getPageTitle()}</h2>
      {error && <div className={styles.error}>{error}</div>}
      {/* 폼 입력 필드들 */}
      <div className={styles.formGroup}>
        <label htmlFor='title'>제목</label>
        <input
          type='text'
          id='title'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor='content'>내용</label>
        <textarea
          id='content'
          rows='15'
          value={content}
          onChange={(e) => setContent(e.target.value)}
        ></textarea>
      </div>
      {/* 결재선 */}
      <div className={styles.formGroup}>
        <label>결재선</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type='text'
            value={approvers.map((a) => a.name + ' (' + a.id + ')').join(', ')}
            readOnly
            placeholder='직원 선택'
            style={{ flex: 1 }}
            onClick={() => setShowApproverModal(true)}
          />
          <button
            type='button'
            onClick={() => setShowApproverModal(true)}
            style={{
              background: '#1976d2',
              color: '#fff',
              border: 'none',
              borderRadius: '16px',
              height: '32px',
              padding: '0 16px',
              cursor: 'pointer',
              fontWeight: 500,
              transition: 'background 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = '#1565c0')}
            onMouseOut={(e) => (e.currentTarget.style.background = '#1976d2')}
          >
            직원 추가
          </button>
        </div>
      </div>
      {/* 참조자 */}
      <div className={styles.formGroup}>
        <label>참조자</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type='text'
            value={references.map((a) => a.name + ' (' + a.id + ')').join(', ')}
            readOnly
            placeholder='직원 선택'
            style={{ flex: 1 }}
            onClick={() => setShowReferenceModal(true)}
          />
          <button
            type='button'
            onClick={() => setShowReferenceModal(true)}
            style={{
              background: '#1976d2',
              color: '#fff',
              border: 'none',
              borderRadius: '16px',
              height: '32px',
              padding: '0 16px',
              cursor: 'pointer',
              fontWeight: 500,
              transition: 'background 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = '#1565c0')}
            onMouseOut={(e) => (e.currentTarget.style.background = '#1976d2')}
          >
            직원 추가
          </button>
        </div>
      </div>
      {/* 모달 렌더링 */}
      {showApproverModal && (
        <EmployeeSelectModal
          open={showApproverModal}
          onClose={() => setShowApproverModal(false)}
          onSelect={setApprovers}
          selectedEmployees={approvers}
          multiple={true}
        />
      )}
      {showReferenceModal && (
        <EmployeeSelectModal
          open={showReferenceModal}
          onClose={() => setShowReferenceModal(false)}
          onSelect={setReferences}
          selectedEmployees={references}
          multiple={true}
        />
      )}
      {/* 첨부파일 인풋 */}
      <div className={styles.formGroup}>
        <label htmlFor='attachment'>첨부파일</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <input
            type='file'
            id='attachment'
            name='attachment'
            multiple
            style={{ display: 'none' }}
            onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
          />
          <label
            htmlFor='attachment'
            style={{
              background: '#1976d2',
              color: '#fff',
              border: 'none',
              borderRadius: '16px',
              height: '32px',
              padding: '0 16px',
              cursor: 'pointer',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              transition: 'background 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = '#1565c0')}
            onMouseOut={(e) => (e.currentTarget.style.background = '#1976d2')}
          >
            파일 선택
          </label>
          <span style={{ fontSize: 14, color: '#333', whiteSpace: 'pre-line' }}>
            {selectedFiles.length > 0
              ? selectedFiles.map((f) => f.name).join(', ')
              : '선택된 파일 없음'}
          </span>
        </div>
      </div>
      {/* 버튼 그룹 */}
      <div className={styles.buttonGroup}>
        {isResubmitMode ? (
          <button
            onClick={handleResubmit}
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? '전송 중...' : '재상신하기'}
          </button>
        ) : (
          <>
            <button onClick={handleSaveOrUpdateDraft} disabled={isSubmitting}>
              {isSubmitting
                ? '저장 중...'
                : isEditMode
                  ? '수정하기'
                  : '임시 저장'}
            </button>
            <button
              onClick={handleSubmitForApproval}
              className={styles.submitButton}
              disabled={!isEditMode || isSubmitting}
            >
              상신
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ApprovalForm;
