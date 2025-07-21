import React, { useState, useEffect, useCallback } from 'react';
import {
  useNavigate,
  useParams,
  useSearchParams,
  useBlocker,
} from 'react-router-dom';
import styles from './ApprovalNew.module.scss';
import { useApprovalForm } from '../../hooks/useApprovalForm';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
import EmployeeSelectModal from '../../components/approval/EmployeeSelectModal';
import TemplateSelectionModal from '../../components/approval/TemplateSelectionModal';
import VisualApprovalLine from '../../components/approval/VisualApprovalLine';
import AttachmentList from '../../components/approval/AttachmentList';
import FormField from './FormField';
import QuillEditor from '../../components/editor/QuillEditor';
import axiosInstance from '../../configs/axios-config';
import { API_BASE_URL, APPROVAL_SERVICE } from '../../configs/host-config';

const MySwal = withReactContent(Swal);

export default function ApprovalNew() {
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

  const [files, setFiles] = useState([]);
  const [isApproverModalOpen, setIsApproverModalOpen] = useState(false);
  const [isReferenceModalOpen, setIsReferenceModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // 1) 실제 제출/임시저장 로직
  const handleFinalSubmit = useCallback(
    async (isSubmit = false, isMovingAway = false) => {
      if (isSubmit) setIsSubmitting(true);
      else setIsSaving(true);

      // 요청 DTO 조립
      const reqDto = {
        title: formData.title,
        content: formData.content,
        templateId: template?.id,
        reportTemplateData: JSON.stringify(formData),
        approvalLine,
        references,
      };
      const submissionData = new FormData();
      submissionData.append(
        'req',
        new Blob([JSON.stringify(reqDto)], { type: 'application/json' }),
      );
      files.forEach((file) => submissionData.append('files', file));

      const url = isSubmit
        ? `${API_BASE_URL}${APPROVAL_SERVICE}/submit`
        : `${API_BASE_URL}${APPROVAL_SERVICE}/save`;
      const successMessage = isSubmit
        ? '성공적으로 상신되었습니다.'
        : '임시 저장되었습니다.';

      try {
        const res = await axiosInstance.post(url, submissionData);
        if (
          res.data &&
          (res.data.statusCode === 201 || res.data.statusCode === 200)
        ) {
          setIsDirty(false);
          if (!isMovingAway) {
            alert(successMessage);
            const nextUrl = isSubmit
              ? `/approval/reports/${res.data.result.id}`
              : '/approval/drafts';
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
    },
    [formData, template, approvalLine, references, files, navigate],
  );

  // 2) 페이지 이탈 차단
  const blocker = useBlocker(isDirty);
  useEffect(() => {
    if (blocker.state === 'blocked') {
      MySwal.fire({
        title: '작성중인 내용이 있습니다.',
        text: '페이지를 떠나기 전에 임시저장 하시겠습니까?',
        icon: 'question',
        showCancelButton: true,
        showDenyButton: true,
        confirmButtonText: '예 (임시저장)',
        denyButtonText: '아니요 (그냥 이동)',
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

  // 3) 각종 핸들러: 변경 시 isDirty 플래그 설정
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

  const handleRemoveFile = async (indexToRemove) => {
    setIsDirty(true);
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
      setFiles((prev) => prev.filter((_, i) => i !== indexToRemove));
    }
  };

  if (loading) return <p>로딩 중...</p>;
  if (error) return <p>오류: {error}</p>;

  return (
    <div className={styles.pageContainer}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleFinalSubmit(true);
        }}
      >
        {/* 문서 제목 & 필드 */}
        <div className={styles.section}>
          <h3>{template ? template.title : '결재 문서 작성'}</h3>
          <table className={styles.approvalFormTable}>
            <tbody>
              <tr>
                <th>제목</th>
                <td>
                  <input
                    type='text'
                    id='title'
                    value={formData.title || ''}
                    onChange={(e) => handleValueChange('title', e.target.value)}
                    placeholder='결재 문서의 제목을 입력하세요.'
                    required
                    className={styles.formInput}
                  />
                </td>
              </tr>
              {template?.content
                ?.filter((f) => f.type !== 'editor' && f.id !== 'title')
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
                <td colSpan='3' className={styles.formField}>
                  <QuillEditor
                    value={formData.content || ''}
                    onChange={(c) => handleValueChange('content', c)}
                    placeholder='내용을 입력하세요...'
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 결재선 & 참조 */}
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
                      <VisualApprovalLine
                        approvalLine={approvalLine}
                        mode='full'
                      />
                    </div>
                  ) : (
                    <span style={{ color: '#999', fontStyle: 'italic' }}>
                      결재선이 지정되지 않았습니다.
                    </span>
                  )}
                  <button
                    type='button'
                    onClick={() => setIsApproverModalOpen(true)}
                    className={styles.actionButton}
                  >
                    결재선 지정
                  </button>
                </td>
              </tr>
              <tr>
                <th>참조</th>
                <td>
                  {references.length > 0 ? (
                    <div>
                      <strong>참조자 ({references.length}명):</strong>
                      <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                        {references.map((r, i) => (
                          <li key={i}>{r.name || `직원ID: ${r.employeeId}`}</li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <span style={{ color: '#999', fontStyle: 'italic' }}>
                      참조자가 지정되지 않았습니다.
                    </span>
                  )}
                  <button
                    type='button'
                    onClick={() => setIsReferenceModalOpen(true)}
                    className={styles.actionButton}
                  >
                    참조자 지정
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 파일 첨부 */}
        <div className={styles.section}>
          <h3>파일 첨부</h3>
          <table className={styles.approvalFormTable}>
            <tbody>
              <tr>
                <th>첨부파일</th>
                <td>
                  <div className={styles.fileUploadArea}>
                    <input
                      type='file'
                      id='files'
                      multiple
                      onChange={handleFileChange}
                      className={styles.fileInput}
                    />
                    <label htmlFor='files' className={styles.fileUploadButton}>
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
                        {files.map((file, idx) => (
                          <div key={idx} className={styles.fileItem}>
                            <span className={styles.fileName}>{file.name}</span>
                            <span className={styles.fileSize}>
                              ({(file.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                            <button
                              type='button'
                              onClick={() => handleRemoveFile(idx)}
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
                      <AttachmentList attachments={attachments} readonly />
                    </div>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 액션 버튼 */}
        <div className={styles.actions}>
          <button
            type='submit'
            disabled={isSubmitting || isSaving}
            className={styles.submitButton}
          >
            {isSubmitting ? '상신 중...' : '상신'}
          </button>
          <button
            type='button'
            onClick={() => handleFinalSubmit(false)}
            disabled={isSubmitting || isSaving}
            className={styles.draftButton}
          >
            {isSaving ? '저장 중...' : '임시 저장'}
          </button>
          <button
            type='button'
            onClick={() => navigate(-1)}
            className={styles.cancelButton}
          >
            취소
          </button>
        </div>
      </form>

      {/* 모달 */}
      {isApproverModalOpen && (
        <EmployeeSelectModal
          open
          onClose={() => setIsApproverModalOpen(false)}
          onSelect={handleSelectApprovers}
          multiple
        />
      )}
      {isReferenceModalOpen && (
        <EmployeeSelectModal
          open
          onClose={() => setIsReferenceModalOpen(false)}
          onSelect={handleSelectReferences}
          multiple
        />
      )}
      {isTemplateModalOpen && (
        <TemplateSelectionModal
          open
          onClose={() => setIsTemplateModalOpen(false)}
          onStartWriting={(tid) => navigate(`/approval/new?templateId=${tid}`)}
        />
      )}
    </div>
  );
}
