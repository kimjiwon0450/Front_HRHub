import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axiosInstance from '../../configs/axios-config';
import { API_BASE_URL, APPROVAL_SERVICE } from '../../configs/host-config';
import styles from './ApprovalForm.module.scss';
import EmployeeSelectModal from '../../components/approval/EmployeeSelectModal';

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

  // useEffect(() => {
  //   if (reportId) {
  //     // 수정 또는 재상신 모드일 때
  //     const fetchReportData = async () => {
  //       try {
  //         const res = await axiosInstance.get(
  //           `${API_BASE_URL}${APPROVAL_SERVICE}/reports/${reportId}`,
  //         );
  //         const report = res.data.result;
  //         setTitle(report.title);
  //         setContent(report.content);
  //         setApprovers(
  //           report.approvalLine.map((a) => ({
  //             id: a.employeeId,
  //             name: a.employeeName,
  //           })),
  //         );
  //         setReferences(
  //           report.references.map((r) => ({
  //             id: r.employeeId,
  //             name: r.employeeName,
  //           })),
  //         );
  //       } catch (err) {
  //         setError('보고서 정보를 불러오는 데 실패했습니다.');
  //       }
  //     };
  //     fetchReportData();
  //   }
  // }, [reportId]);

  // '임시 저장' (상태: DRAFT)만 남김
  const handleSaveDraft = async () => {
    if (!title) {
      alert('제목을 입력해주세요.');
      return;
    }
    setIsSubmitting(true); // 중복으로 버튼을 여러번 누르지 못하게 하기위해서
    setError(null);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    approvers.forEach((a, idx) => {
      formData.append(`approvalLine[${idx}].employeeId`, a.id);
    });
    references.forEach((a, idx) => {
      formData.append(`references[${idx}]`, a.id);
    });

    console.log(formData.get('references'));
    console.log(formData.get('approvalLine'));

    try {
      await axiosInstance.post(
        `${API_BASE_URL}${APPROVAL_SERVICE}/create`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );
      alert('임시 저장되었습니다.');
      navigate('/approval/drafts');
    } catch (err) {
      setError(err.response?.data?.message || '처리 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // const handleResubmit = async () => {
  //   if (!window.confirm('이 내용으로 재상신하시겠습니까?')) {
  //     return;
  //   }

  //   setIsSubmitting(true);
  //   setError(null);

  //   const formData = new FormData();
  //   formData.append('newTitle', title);
  //   formData.append('newContent', content);
  //   approvers.forEach((a, idx) => {
  //     formData.append(`approvalLine[${idx}].employeeId`, a.id);
  //   });
  //   references.forEach((a, idx) => {
  //     formData.append(`references[${idx}].employeeId`, a.id);
  //   });
  //   selectedFiles.forEach((file) => {
  //     formData.append('attachments', file);
  //   });

  //   try {
  //     await axiosInstance.post(
  //       `${API_BASE_URL}${APPROVAL_SERVICE}/reports/${reportId}/resubmit`,
  //       formData,
  //       { headers: { 'Content-Type': 'multipart/form-data' } },
  //     );
  //     alert('성공적으로 재상신되었습니다.');
  //     navigate('/approval/drafts');
  //   } catch (err) {
  //     setError(err.response?.data?.message || '재상신 중 오류가 발생했습니다.');
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  // 화면 타이틀 함수 복구
  const getPageTitle = () => '기안서 작성';

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
        <div className={styles.approverRow}>
          <input
            type='text'
            value={approvers.map((a) => a.name + ' (' + a.id + ')').join(', ')}
            readOnly
            placeholder='직원 선택'
            className={styles.approverInput}
            onClick={() => setShowApproverModal(true)}
          />
          <button
            type='button'
            onClick={() => setShowApproverModal(true)}
            className={styles.addEmployeeButton}
          >
            직원 추가
          </button>
        </div>
      </div>
      {/* 참조자 */}
      <div className={styles.formGroup}>
        <label>참조자</label>
        <div className={styles.approverRow}>
          <input
            type='text'
            value={references.map((a) => a.name + ' (' + a.id + ')').join(', ')}
            readOnly
            placeholder='직원 선택'
            className={styles.approverInput}
            onClick={() => setShowReferenceModal(true)}
          />
          <button
            type='button'
            onClick={() => setShowReferenceModal(true)}
            className={styles.addEmployeeButton}
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
        <div className={styles.attachmentRow}>
          <input
            type='file'
            id='attachment'
            name='attachment'
            multiple
            style={{ display: 'none' }}
            onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
          />
          <label htmlFor='attachment' className={styles.fileSelectButton}>
            파일 선택
          </label>
          <span className={styles.selectedFilesText}>
            {selectedFiles.length > 0
              ? selectedFiles.map((f) => f.name).join(', ')
              : '선택된 파일 없음'}
          </span>
        </div>
      </div>
      {/* 버튼 그룹 */}
      <div className={styles.buttonGroup}>
        <button onClick={handleSaveDraft} disabled={isSubmitting}>
          {isSubmitting ? '저장 중...' : '임시 저장하기'}
        </button>
      </div>
    </div>
  );
};

export default ApprovalForm;
