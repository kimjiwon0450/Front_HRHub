import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axiosInstance from '../../configs/axios-config';
import { API_BASE_URL, APPROVAL_SERVICE } from '../../configs/host-config';
import styles from './ApprovalForm.module.scss';
import EmployeeSelectModal from '../../components/approval/EmployeeSelectModal';

const ApprovalForm = () => {
  const navigate = useNavigate();
  const { reportId } = useParams(); // URL에서 reportId 가져오기
  const location = useLocation(); // URL 정보 가져오기

  const [isEditMode, setIsEditMode] = useState(false); // 새로 작성 or 수정
  const [isResubmitMode, setIsResubmitMode] = useState(false); // 재상신 모드

  // 템플릿 정보
  const [template, setTemplate] = useState(null); // 로드된 템플릿 정보
  const [formData, setFormData] = useState({}); // 템플릿 기반 동적 폼 데이터

  // 기존 상태
  const [title, setTitle] = useState('');
  const [content, setContent] = useState(''); // 이제 기본 내용으로 사용
  const [approvers, setApprovers] = useState([]); // 결재선
  const [references, setReferences] = useState([]); // 참조
  const [showApproverModal, setShowApproverModal] = useState(false);
  const [showReferenceModal, setShowReferenceModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [originalReport, setOriginalReport] = useState(null); // 원본 문서 (재상신/수정 시)

  useEffect(() => {
    // URL에서 templateId 쿼리 파라미터 추출
    const queryParams = new URLSearchParams(location.search);
    const templateId = queryParams.get('templateId');

    if (templateId) {
      // 템플릿 ID가 있으면 템플릿 정보 로드
      const fetchTemplate = async () => {
        try {
          const res = await axiosInstance.get(
            `${API_BASE_URL}${APPROVAL_SERVICE}/templates/${templateId}`,
          );
          const fetchedTemplate = res.data.result.template;

          let parsedContent = [];
          if (
            fetchedTemplate.content &&
            typeof fetchedTemplate.content === 'string'
          ) {
            try {
              parsedContent = JSON.parse(fetchedTemplate.content);
            } catch (e) {
              console.error('Template content parsing error:', e);
              // 파싱 실패 시 기본 텍스트 영역으로 처리
              parsedContent = [
                {
                  type: 'textarea',
                  header: '내용',
                  value: fetchedTemplate.content,
                },
              ];
            }
          } else if (Array.isArray(fetchedTemplate.content)) {
            parsedContent = fetchedTemplate.content;
          }

          setTemplate({ ...fetchedTemplate, content: parsedContent });
          setTitle(fetchedTemplate.title); // 템플릿 제목을 문서 제목으로 설정

          // 동적 폼 데이터 초기화
          const initialFormData = parsedContent.reduce((acc, field) => {
            acc[field.header] = '';
            return acc;
          }, {});
          setFormData(initialFormData);
        } catch (error) {
          console.error('Failed to fetch template:', error);
          alert('템플릿을 불러오는 데 실패했습니다.');
          navigate('/approval/home');
        }
      };
      fetchTemplate();
    } else if (reportId) {
      // 기존 문서(임시저장, 재상신) 로드
      setIsEditMode(true);
      fetchReportData(reportId);
    }
  }, [reportId, location.search, navigate]);

  const fetchReportData = async (id) => {
    try {
      const res = await axiosInstance.get(
        `${API_BASE_URL}${APPROVAL_SERVICE}/reports/${id}`,
      );
      const report = res.data.data; // API 명세에 따라 'result'를 'data'로 수정

      console.log(reportId);

      if (report) {
        setTitle(report.title);
        setContent(report.content);
        setApprovers(report.approvalLine.map((a) => a.employeeId).join(', '));
        setReferences(report.references.map((r) => r.employeeId).join(', '));
        setOriginalReport(report); // 원본 문서 저장
      }
    } catch (err) {
      console.error('보고서 정보를 불러오는 데 실패했습니다.', err);
      setError('보고서 정보를 불러오는 데 실패했습니다.');
    }
  };

  const handleFormDataChange = (header, value) => {
    setFormData((prev) => ({ ...prev, [header]: value }));
  };

  // 템플릿 기반 동적 폼 렌더링 함수
  const renderTemplateForm = () => {
    if (!template || !template.content) return null;

    return template.content.map((field, index) => (
      <div key={index} className={styles.formGroup}>
        <label htmlFor={`template-field-${index}`}>{field.header}</label>
        {renderFormField(field, index)}
      </div>
    ));
  };

  const renderFormField = (field, index) => {
    const fieldId = `template-field-${index}`;
    switch (field.type) {
      case 'text':
        return (
          <input
            type='text'
            id={fieldId}
            value={formData[field.header] || ''}
            onChange={(e) => handleFormDataChange(field.header, e.target.value)}
          />
        );
      case 'number':
        return (
          <input
            type='number'
            id={fieldId}
            value={formData[field.header] || ''}
            onChange={(e) => handleFormDataChange(field.header, e.target.value)}
          />
        );
      case 'date':
        return (
          <input
            type='date'
            id={fieldId}
            value={formData[field.header] || ''}
            onChange={(e) => handleFormDataChange(field.header, e.target.value)}
          />
        );
      case 'textarea':
        return (
          <textarea
            id={fieldId}
            rows='5'
            value={formData[field.header] || ''}
            onChange={(e) => handleFormDataChange(field.header, e.target.value)}
          ></textarea>
        );
      default:
        return <p>지원하지 않는 필드 타입입니다: {field.type}</p>;
    }
  };

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
      formData.append(`references[${idx}].employeeId`, a.id);
    });

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
          placeholder='문서 제목을 입력하세요'
        />
      </div>

      {/* 템플릿 기반 동적 폼 렌더링 */}
      {template && renderTemplateForm()}

      <div className={styles.formGroup}>
        <label htmlFor='content'>상세 내용</label>
        <textarea
          id='content'
          rows='10'
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder='상세 내용을 입력하세요'
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
