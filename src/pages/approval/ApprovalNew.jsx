import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams, useBlocker } from 'react-router-dom';
import styles from './ApprovalNew.module.scss';
import { useApprovalForm } from '../../hooks/useApprovalForm';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import EmployeeSelectModal from '../../components/approval/EmployeeSelectModal';
import VisualApprovalLine from '../../components/approval/VisualApprovalLine';
import AttachmentList from '../../components/approval/AttachmentList';
import FormField from './FormField';
import QuillEditor from '../../components/editor/QuillEditor';
import axiosInstance from '../../configs/axios-config';
import { API_BASE_URL, APPROVAL_SERVICE } from '../../configs/host-config';
import Swal from 'sweetalert2';
import TemplateSelectionModal from '../../components/approval/TemplateSelectionModal';

const MySwal = withReactContent(Swal);

function ApprovalNew() {
  const { reportId } = useParams();
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get('templateId') || reportId;
  const navigate = useNavigate();

  const {
    template,
    formData,
    setFormData,
    approvalLine,
    setApprovalLine,
    references,
    setReferences,
    attachments,
    loading,
    error,
  } = useApprovalForm(templateId, reportId);

  const [isApproverModalOpen, setIsApproverModalOpen] = useState(false);
  const [isReferenceModalOpen, setIsReferenceModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [files, setFiles] = useState([]);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false); // 폼 내용 변경 여부

  // useCallback을 사용하여 함수가 항상 최신 상태를 참조하도록 함
  const handleFinalSubmit = useCallback(async (isSubmit = false, isMovingAway = false) => {
    // ... (이 함수는 이전과 동일)
     if (isSubmit) setIsSubmitting(true);
    else setIsSaving(true);

  const handleSelectApprovers = (selected) => {
    setApprovalLine(selected);
    setIsApproverModalOpen(false); // 모달 닫기 추가
  };

  const handleSelectReferences = (selected) => {
    setReferences(selected);
    setIsReferenceModalOpen(false); // 모달 닫기 추가
  };

  const handleFileChange = (e) => {
    // 새로 선택한 파일들로 기존 목록을 완전히 교체합니다.
    setFiles(Array.from(e.target.files));
  };

  const handleRemoveFile = async (indexToRemove) => {
    const result = await Swal.fire({
      title: '파일을 삭제하시겠습니까?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '예',
      cancelButtonText: '아니요',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    });

    if (result.isConfirmed) {
      setFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
    }
  };

  const handleFinalSubmit = async (isSubmit = false) => {
    if (isSubmit) {
      setIsSubmitting(true);
    } else {
      setIsSaving(true);
    }

    console.log(`%c[4단계: 저장 직전 template 상태]`, 'color: red; font-weight: bold;', template);

    // 1. DTO와 정확히 일치하는 구조의 자바스크립트 객체를 먼저 만듭니다.
    const reqDto = {
      title: formData.title,
      content: formData.content,
      templateId: template?.id,
      reportTemplateData: JSON.stringify(formData),
      approvalLine: approvalLine,
      references: references,
    };
    const submissionData = new FormData();
    submissionData.append('req', new Blob([JSON.stringify(reqDto)], { type: 'application/json' }));
    files.forEach((file) => submissionData.append('files', file));

    const url = isSubmit
      ? `${API_BASE_URL}${APPROVAL_SERVICE}/submit`
      : `${API_BASE_URL}${APPROVAL_SERVICE}/save`;
      
    const successMessage = isSubmit ? '성공적으로 상신되었습니다.' : '임시 저장되었습니다.';

    try {
      const res = await axiosInstance.post(url, submissionData);
      if (res.data && (res.data.statusCode === 201 || res.data.statusCode === 200)) {
        setIsDirty(false);
        if (!isMovingAway) {
          alert(successMessage);
          const nextUrl = isSubmit ? `/approval/reports/${res.data.result.id}` : '/approval/drafts';
          navigate(nextUrl);
        }
      } else {
        throw new Error(res.data.statusMessage || '요청에 실패했습니다.');
      }
    } catch (err) {
      console.error(`요청 실패: ${url}`, err);
      if (!isMovingAway) {
        alert(`오류: ${err.response?.data?.statusMessage || err.message}`);
      }
    } finally {
      if (isSubmit) setIsSubmitting(false);
      else setIsSaving(false);
    }
  }, [formData, template, approvalLine, references, files, navigate, reportId]);

  // React Router v7의 useBlocker로 페이지 이탈 감지
  const blocker = useBlocker(isDirty);

  useEffect(() => {
    if (blocker.state === 'blocked') {
      MySwal.fire({
        title: '작성중인 내용이 있습니다.',
        text: "페이지를 떠나기 전에 임시저장 하시겠습니까?",
        icon: 'question',
        showCancelButton: true,
        showDenyButton: true,
        confirmButtonText: '예 (임시저장)',
        denyButtonText: '아니오 (그냥 이동)',
        cancelButtonText: '취소 (머무르기)',
      }).then(async (result) => {
        if (result.isConfirmed) {
          await handleFinalSubmit(false, true);
          blocker.proceed();
        } else if (result.isDenied) {
          blocker.proceed();
        } else {
          blocker.reset();
        }
      });
    }
  }, [blocker, handleFinalSubmit]);

  // ★★★ 핵심 수정: 폼을 수정하는 모든 핸들러에 setIsDirty(true)를 추가합니다. ★★★
  const handleValueChange = (id, value) => {
    setIsDirty(true);
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectApprovers = (selected) => {
    setIsDirty(true);
    setApprovalLine(selected);
    setIsApproverModalOpen(false);
  };

  const handleSelectReferences = (selected) => {
    setIsDirty(true);
    setReferences(selected);
    setIsReferenceModalOpen(false);
  };

  const handleFileChange = (e) => {
    setIsDirty(true);
    setFiles(Array.from(e.target.files));
  };

  const handleRemoveFile = (indexToRemove) => {
    setIsDirty(true);
    setFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
  };

  if (loading) return <p>로딩 중...</p>;
  if (error) return <p>오류: {error}</p>;

  return (
    <div className={styles.pageContainer}>
      {/* 
        각 input, QuillEditor, EmployeeSelectModal 등이 
        위에서 수정한 핸들러 함수들(handleValueChange, handleSelectApprovers 등)을 
        props로 잘 전달받고 있는지 확인하는 것이 중요합니다.
      */}
      <form onSubmit={(e) => { e.preventDefault(); handleFinalSubmit(true); }}>
        <div className={styles.section}>
          <h3>{template ? template.title : '결재 문서 작성'}</h3>
          <table className={styles.approvalFormTable}>
            <tbody>
              <tr>
                <th>제목</th>
                <td>
                  <input
                    type="text"
                    id="title"
                    value={formData.title || ''}
                    onChange={(e) => handleValueChange('title', e.target.value)}
                    placeholder="결재 문서의 제목을 입력하세요."
                    required
                    className={styles.formInput}
                  />
                </td>
              </tr>
              {template?.content
                ?.filter((field) => field.type !== 'editor' && field.id !== 'title')
                .map((field) => (
                  <FormField
                    key={field.id}
                    field={field}
                    value={formData}
                    onChange={handleValueChange}
                  />
                ))}
              <tr>
                <td className={styles.formLabel}>내용</td>
                <td colSpan="3" className={styles.formField}>
                  {console.log('QuillEditor 렌더링')}
                  <QuillEditor
                    value={formData.content || ""}
                    onChange={(content) => handleValueChange("content", content)}
                    placeholder="내용을 입력하세요..."
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ... (이하 결재선, 파일첨부, 버튼 등 렌더링 코드는 동일) ... */}
        <div className={styles.section}>
          <h3>결재선 정보</h3>
          <table className={styles.approvalFormTable}>
            <tbody>
              <tr>
                <th>결재선</th>
                <td>
                  {approvalLine.length > 0 ? (
                    <div>
                      <strong>결재자 ({approvalLine.length}명):</strong>
                      <VisualApprovalLine approvalLine={approvalLine} mode="full" />
                    </div>
                  ) : (
                    <span style={{ color: '#999', fontStyle: 'italic' }}>결재선이 지정되지 않았습니다.</span>
                  )}
                  <button type="button" onClick={() => setIsApproverModalOpen(true)} className={styles.actionButton}>
                    결재선 지정
                  </button>
                </td>
              </tr>
              <tr>
                <th>참조</th>
                <td>
                  <div className={styles.referenceContainer}>
                    {references.length > 0 ? (
                      <div>
                        <strong>참조자 ({references.length}명):</strong>
                        <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                          {references.map((r, index) => (
                            <li key={index}>
                              {r.name ? r.name : `직원ID: ${r.employeeId}`}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <span style={{ color: '#999', fontStyle: 'italic' }}>참조자가 지정되지 않았습니다.</span>
                    )}
                  </div>
                  <button type="button" onClick={() => setIsReferenceModalOpen(true)} className={styles.actionButton}>
                    참조자 지정
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className={styles.section}>
          <h3>파일 첨부</h3>
          <table className={styles.approvalFormTable}>
            <tbody>
              <tr>
                <th>첨부파일</th>
                <td>
                  <div className={styles.fileUploadArea}>
                    <input 
                      type="file" 
                      id="files" 
                      multiple 
                      onChange={handleFileChange}
                      className={styles.fileInput}
                    />
                    <label htmlFor="files" className={styles.fileUploadButton}>
                      📁 파일 선택
                    </label>
                    <span className={styles.fileUploadHint}>
                      여러 파일을 선택할 수 있습니다
                    </span>
                  </div>
                  
                  {files.length > 0 && (
                    <div className={styles.selectedFilesSection}>
                      <h4>선택된 파일 ({files.length}개)</h4>
                      <div className={styles.fileList}>
                        {files.map((file, index) => (
                          <div key={index} className={styles.fileItem}>
                            <span className={styles.fileName}>{file.name}</span>
                            <span className={styles.fileSize}>
                              ({(file.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                            <button 
                              type="button" 
                              onClick={() => handleRemoveFile(index)} 
                              className={styles.removeFileButton}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {attachments.length > 0 && (
                    <div className={styles.existingFilesSection}>
                      <h4>기존 첨부파일 ({attachments.length}개)</h4>
                      <AttachmentList 
                        attachments={attachments} 
                        readonly={true}
                      />
                    </div>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className={styles.actions}>
          <button type="submit" disabled={isSubmitting || isSaving} className={styles.submitButton}>
            {isSubmitting ? '상신 중...' : '상신'}
          </button>
          <button type="button" onClick={() => handleFinalSubmit(false)} disabled={isSubmitting || isSaving} className={styles.draftButton}>
            {isSaving ? '저장 중...' : '임시 저장'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className={styles.cancelButton}>취소</button>
        </div>
      </form>
      {isApproverModalOpen && (
        <EmployeeSelectModal
          open={isApproverModalOpen}
          onClose={() => setIsApproverModalOpen(false)}
          onSelect={handleSelectApprovers}
          multiple
        />
      )}
      {isReferenceModalOpen && (
        <EmployeeSelectModal
          open={isReferenceModalOpen}
          onClose={() => setIsReferenceModalOpen(false)}
          onSelect={handleSelectReferences}
          multiple
        />
      )}
       {isTemplateModalOpen && (
        <TemplateSelectionModal
          open={isTemplateModalOpen}
          onClose={() => setIsTemplateModalOpen(false)}
          onStartWriting={(templateId) => navigate(`/approval/new?templateId=${templateId}`)}
        />
      )}
    </div>
  );
}

export default ApprovalNew;