import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './ApprovalNew.module.scss';
import { useApprovalForm } from '../../hooks/useApprovalForm';
import EmployeeSelectModal from '../../components/approval/EmployeeSelectModal';
import VisualApprovalLine from '../../components/approval/VisualApprovalLine';
import FormField from './FormField'; // FormField 컴포넌트 임포트
import QuillEditor from '../../components/editor/QuillEditor'; // 새로 만든 에디터 컴포넌트 import
import axiosInstance from '../../configs/axios-config';
import { API_BASE_URL, APPROVAL_SERVICE } from '../../configs/host-config';

function ApprovalNew() {
  const { templateId, reportId } = useParams();
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
  const [isSaving, setIsSaving] = useState(false); // 임시 저장 로딩 상태
  const [files, setFiles] = useState([]);

<<<<<<< HEAD
  useEffect(() => {
    const fetchTemplate = async () => {
      if (!templateId) return;
      try {
        setLoading(true);
        const res = await axiosInstance.get(
          `${API_BASE_URL}${APPROVAL_SERVICE}/templates/${templateId}`,
        );
        if (res.data && res.data.result && res.data.result.template) {
          const fetchedTemplate = res.data.result.template;
          setTemplate(fetchedTemplate);
          setTitle(fetchedTemplate.title); // template.title을 기본 제목으로 사용

          // content 필드에서 에디터 내용을 추출하여 상태에 설정
          let initialContent = '';
          if (Array.isArray(fetchedTemplate.content)) {
            const editorField = fetchedTemplate.content.find(
              (f) => f.type === 'editor',
            );
            if (editorField) {
              initialContent = editorField.value || '';
            }
          }
          setContent(initialContent);

          if (fetchedTemplate.formSchema) {
            const initialValues = fetchedTemplate.formSchema.reduce(
              (acc, field) => {
                acc[field.key] = '';
                return acc;
              },
              {},
            );
            setFormValues(initialValues);
          }
        } else {
          throw new Error('Template data not found in response');
        }
      } catch (err) {
        console.error('Failed to fetch template:', err);
        setError('템플릿을 불러오는 데 실패했습니다. 목록으로 돌아갑니다.');
        setTimeout(() => navigate('/approval/templates/list'), 3000);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplate();
  }, [templateId, navigate]);

  const handleFormChange = (key, value) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSelectApprovers = (selected) => {
    // API 명세에 따라 context 필드 추가
    const approversWithContext = selected.map((emp) => ({
      ...emp,
      context: '검토',
    }));
    setApprovers(approversWithContext);
=======
  const handleValueChange = (id, value) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectApprovers = (selected) => {
    setApprovalLine(selected);
    setIsApproverModalOpen(false); // 모달 닫기 추가
>>>>>>> approval-service
  };

  const handleSelectReferences = (selected) => {
    setReferences(selected);
    setIsReferenceModalOpen(false); // 모달 닫기 추가
  };

  const handleFileChange = (e) => {
    // 새로 선택한 파일들로 기존 목록을 완전히 교체합니다.
    setFiles(Array.from(e.target.files));
  };

  const handleRemoveFile = (indexToRemove) => {
    setFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
  };

  const handleFinalSubmit = async (isSubmit = false) => {
    if (isSubmit) {
      setIsSubmitting(true);
    } else {
      setIsSaving(true);
    }

<<<<<<< HEAD
    const reportData = {
      templateId: parseInt(templateId, 10),
      title,
      content, // Add editor content to the submission
      values: formValues,
      approvalLine: approvers.map((a) => ({
        employeeId: a.id,
        context: a.context || '검토',
      })),
      references: references.map((r) => ({ employeeId: r.id })),
    };

    const formData = new FormData();
    formData.append(
      'req',
      new Blob([JSON.stringify(reportData)], { type: 'application/json' }),
    );

    if (files.length > 0) {
      files.forEach((file) => {
        formData.append('files', file);
      });
    }

    try {
      const res = await axiosInstance.post(
        `${API_BASE_URL}${APPROVAL_SERVICE}/reports/category`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );
=======
    console.log("임시 저장 직전의 template 객체:", template);

    // 1. DTO와 정확히 일치하는 구조의 자바스크립트 객체를 먼저 만듭니다.
    const reqDto = {
      title: formData.title,
      content: formData.content,
      templateId: template?.id,
      reportTemplateData: JSON.stringify(formData),
      approvalLine: approvalLine,
      references: references,
    };

    // 2. 최종적으로 서버에 보낼 FormData 객체를 생성합니다.
    const submissionData = new FormData();
    console.log("임시 저장 직전의 template 객체:", template);
    console.log("임시 저장 직전의 formData:", formData);
    // 3. 위에서 만든 자바스크립트 객체(reqDto)를 'req'라는 이름의 파트로 추가합니다.
    //    Blob을 사용하여 Content-Type을 'application/json'으로 명시해줍니다.
    submissionData.append(
      'req',
      new Blob([JSON.stringify(reqDto)], {
        type: 'application/json',
      }),
    );

    // 4. 파일들을 'files'라는 이름의 파트로 추가합니다.
    files.forEach((file) => {
      submissionData.append('files', file);
    });

    // 5. API를 호출합니다.
    const url = isSubmit
      ? `${API_BASE_URL}${APPROVAL_SERVICE}/submit`
      : `${API_BASE_URL}${APPROVAL_SERVICE}/save`;
    const successMessage = isSubmit
      ? '성공적으로 상신되었습니다.'
      : '임시 저장되었습니다.';

    try {
      const res = await axiosInstance.post(url, submissionData);
>>>>>>> approval-service

      if (
        res.data &&
        (res.data.statusCode === 201 || res.data.statusCode === 200)
      ) {
        alert(successMessage);
        const nextUrl = isSubmit
          ? `/approval/reports/${res.data.result.id}`
          : '/approval/drafts';
        navigate(nextUrl);
      } else {
        throw new Error(res.data.statusMessage || '요청에 실패했습니다.');
      }
    } catch (err) {
<<<<<<< HEAD
      console.error('Submission failed:', err);
      setError(
        err.response?.data?.message ||
          err.message ||
          '서버 오류가 발생했습니다.',
      );
      alert(`오류: ${error}`);
=======
      console.error(`요청 실패: ${url}`, err);
      alert(`오류: ${err.response?.data?.statusMessage || err.message}`);
>>>>>>> approval-service
    } finally {
      if (isSubmit) {
        setIsSubmitting(false);
      } else {
        setIsSaving(false);
      }
    }
  };

  if (loading) return <p>로딩 중...</p>;
  if (error) return <p>오류: {error}</p>;

  return (
    <div className={styles.pageContainer}>
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
                  />
                </td>
              </tr>
              {template?.content
                ?.filter((field) => field.type !== 'editor')
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
                  <QuillEditor
                    value={formData.content || ""}
                    onChange={(content) =>
                      handleValueChange("content", content)
                    }
                    placeholder="내용을 입력하세요..."
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

<<<<<<< HEAD
        {renderDynamicForm()}

        <div className={styles.formGroup}>
          <label>내용</label>
          <TiptapEditor content={content} onUpdate={setContent} />
        </div>

        <div className={styles.formGroup}>
          <label>결재선</label>
          <VisualApprovalLine approvalLine={approvers} mode='summary' />
          <button
            type='button'
            onClick={() => setIsApproverModalOpen(true)}
            className={styles.actionButton}
          >
            결재선 지정
          </button>
        </div>

        <div className={styles.formGroup}>
          <label>참조</label>
          {/* Simple display for references for now */}
          <div className={styles.participantDisplay}>
            {references.map((r) => r.name).join(', ')}
          </div>
          <button
            type='button'
            onClick={() => setIsReferenceModalOpen(true)}
            className={styles.actionButton}
          >
            참조자 지정
          </button>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor='files'>첨부파일</label>
          <input type='file' id='files' multiple onChange={handleFileChange} />
          {/* Display selected files */}
          <ul>
            {files.map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
        </div>

        <div className={styles.actionButtons}>
          <button
            type='submit'
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? '상신 중...' : '상신하기'}
          </button>
          <button
            type='button'
            className={styles.draftButton}
            disabled={isSubmitting}
          >
            임시저장
=======
        <div className={styles.section}>
          <h3>결재선 정보</h3>
          <table className={styles.approvalFormTable}>
            <tbody>
              <tr>
                <th>결재선</th>
                <td>
                  <VisualApprovalLine approvalLine={approvalLine} mode="full" />
                  <button type="button" onClick={() => setIsApproverModalOpen(true)} className={styles.actionButton}>
                    결재선 지정
                  </button>
                </td>
              </tr>
              <tr>
                <th>참조</th>
                <td>
                  <div className={styles.referenceContainer}>
                    {references.length > 0 ? references.map(r => r.name).join(', ') : ''}
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
                  <input type="file" id="files" multiple onChange={handleFileChange} />
                  <div className={styles.fileList}>
                    {files.map((file, index) => (
                      <span key={index} className={styles.fileTag}>
                        {file.name}
                        <button type="button" onClick={() => handleRemoveFile(index)} className={styles.removeTagButton}>
                          &times;
                        </button>
                      </span>
                    ))}
                    {attachments.map((file) => (
                      <span key={file.id} className={styles.fileTag}>
                        {file.fileName} (기존 파일)
                      </span>
                    ))}
                  </div>
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
>>>>>>> approval-service
          </button>
          <button type="button" onClick={() => navigate(-1)} className={styles.cancelButton}>취소</button>
        </div>
      </form>

      {/* --- DEBUG CODE START --- */}
      {isApproverModalOpen && <h3 style={{ color: 'red' }}>[DEBUG] 결재선 모달 열림 상태입니다.</h3>}
      {isReferenceModalOpen && <h3 style={{ color: 'red' }}>[DEBUG] 참조자 모달 열림 상태입니다.</h3>}
      {/* --- DEBUG CODE END --- */}

      {isApproverModalOpen && (
        <EmployeeSelectModal
          open={isApproverModalOpen} // prop 이름 isOpen -> open으로 수정
          onClose={() => setIsApproverModalOpen(false)}
          onSelect={handleSelectApprovers}
          multiple // isMulti -> multiple로 수정
        />
      )}
      {isReferenceModalOpen && (
        <EmployeeSelectModal
          open={isReferenceModalOpen} // prop 이름 isOpen -> open으로 수정
          onClose={() => setIsReferenceModalOpen(false)}
          onSelect={handleSelectReferences}
          multiple // isMulti -> multiple로 수정
        />
      )}
    </div>
  );
}

export default ApprovalNew;
