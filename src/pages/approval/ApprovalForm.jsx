import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axiosInstance from '../../configs/axios-config';
import { API_BASE_URL, APPROVAL_SERVICE } from '../../configs/host-config';
import styles from './ApprovalForm.module.scss';

const ApprovalForm = () => {
  const navigate = useNavigate();
  const { reportId } = useParams();
  const location = useLocation();

  const isEditMode = reportId && location.pathname.includes('/edit/');
  const isResubmitMode = reportId && location.pathname.includes('/resubmit/');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [approvers, setApprovers] = useState('');
  const [references, setReferences] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const res = await axiosInstance.get(
          `${API_BASE_URL}${APPROVAL_SERVICE}/reports/${reportId}`
        );
        const report = res.data.data; // API 명세에 따라 'result'를 'data'로 수정

        console.log(reportId);
        
        if (report) {
          setTitle(report.title);
          setContent(report.content);
          setApprovers(report.approvalLine.map((a) => a.employeeId).join(', '));
          setReferences(report.references.map((r) => r.employeeId).join(', '));
        }
      } catch (err) {
        console.error('보고서 정보를 불러오는 데 실패했습니다.', err);
        setError('보고서 정보를 불러오는 데 실패했습니다.');
      }
    };

    if (isEditMode || isResubmitMode) {
      fetchReportData();
    } else {
      // 새 작성 모드일 때 폼 초기화
      setTitle('');
      setContent('');
      setApprovers('');
      setReferences('');
    }
  }, [reportId, isEditMode, isResubmitMode]);

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
      approvalLine: approvers.split(',').map(id => ({ employeeId: id.trim() })),
      references: references.split(',').map(id => id.trim()).filter(id => id),
    };

    try {
      if (isEditMode) {
        await axiosInstance.put(`${API_BASE_URL}${APPROVAL_SERVICE}/reports/${reportId}`, payload);
        alert('수정되었습니다.');
      } else {
        await axiosInstance.post(`${API_BASE_URL}${APPROVAL_SERVICE}/create`, payload);
        alert('임시 저장되었습니다.');
      }
      console.log(isEditMode.result);
      navigate('/approval/drafts');
    } catch (err) {
      setError(err.response?.data?.message || '처리 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // '상신하기' (상태: IN_PROGRESS)
  const handleSubmitForApproval = async () => {
    if (!window.confirm("상신하시겠습니까? 상신 후에는 수정할 수 없습니다.")) {
      return;
    }
    
    setIsSubmitting(true);
    setError(null);

    const payload = {
      title,
      content,
      approvalLine: approvers.split(',').map(id => ({ employeeId: id.trim() })),
      references: references.split(',').map(id => id.trim()).filter(id => id),
      reportStatus: 'IN_PROGRESS', // 상신 상태로 변경
    };

    try {
      await axiosInstance.put(`${API_BASE_URL}${APPROVAL_SERVICE}/reports/${reportId}`, payload);
      alert('성공적으로 상신되었습니다.');
      navigate('/approval/drafts');
    } catch (err) {
      setError(err.response?.data?.message || '상신 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResubmit = async () => {
    if (!window.confirm("이 내용으로 재상신하시겠습니까?")) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload = {
      newTitle: title,
      newContent: content,
      approvalLine: approvers.split(',').map(id => ({ employeeId: id.trim() })),
      references: references.split(',').map(id => ({ employeeId: id.trim() })),
    };

    try {
      await axiosInstance.post(`${API_BASE_URL}${APPROVAL_SERVICE}/reports/${reportId}/resubmit`, payload);
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
      {/* 폼 입력 필드들은 동일하게 유지 */}
      <div className={styles.formGroup}>
        <label htmlFor="title">제목</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="content">내용</label>
        <textarea
          id="content"
          rows="15"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        ></textarea>
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="approvers">결재선 (사번을 콤마로 구분하여 입력)</label>
        <input
          type="text"
          id="approvers"
          value={approvers}
          onChange={(e) => setApprovers(e.target.value)}
          placeholder="예: 1001, 1002, 1003"
        />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="references">참조자 (사번을 콤마로 구분하여 입력)</label>
        <input
          type="text"
          id="references"
          value={references}
          onChange={(e) => setReferences(e.target.value)}
        />
      </div>
      <div className={styles.buttonGroup}>
        {isResubmitMode ? (
          <button onClick={handleResubmit} className={styles.submitButton} disabled={isSubmitting}>
            {isSubmitting ? '전송 중...' : '재상신하기'}
          </button>
        ) : (
          <>
            <button onClick={handleSaveOrUpdateDraft} disabled={isSubmitting}>
              {isSubmitting ? '저장 중...' : (isEditMode ? '수정하기' : '임시 저장')}
            </button>
            <button onClick={handleSubmitForApproval} className={styles.submitButton} disabled={!isEditMode || isSubmitting}>
              상신
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ApprovalForm; 