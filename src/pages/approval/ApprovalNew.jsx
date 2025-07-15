import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './ApprovalNew.module.scss';
import axiosInstance from '../../configs/axios-config';
import { API_BASE_URL, APPROVAL_SERVICE } from '../../configs/host-config';

// import 'quill/dist/quill.snow.css'; // Quill snow theme
import EmployeeSelectModal from '../../components/approval/EmployeeSelectModal';
import VisualApprovalLine from '../../components/approval/VisualApprovalLine';

function ApprovalNew() {
  const { templateId } = useParams();
  const navigate = useNavigate();

  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [formValues, setFormValues] = useState({});

  const [approvers, setApprovers] = useState([]);
  const [references, setReferences] = useState([]);
  const [files, setFiles] = useState([]);

  const [isApproverModalOpen, setIsApproverModalOpen] = useState(false);
  const [isReferenceModalOpen, setIsReferenceModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchTemplate = async () => {
      if (!templateId) return;
      try {
        setLoading(true);
        const res = await axiosInstance.get(
          `${API_BASE_URL}${APPROVAL_SERVICE}/templates/${templateId}`,
        );
        if (res.data && res.data.data && res.data.data.template) {
          const fetchedTemplate = res.data.data.template;
          setTemplate(fetchedTemplate);
          setTitle(fetchedTemplate.templateName); // Set initial title
          setContent(fetchedTemplate.contentTemplate || ''); // Set initial content from template

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
    const approversWithContext = selected.map(emp => ({ ...emp, context: '검토' }));
    setApprovers(approversWithContext);
  };

  const handleSelectReferences = (selected) => {
    setReferences(selected);
  };

  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Validation
    if (!title) {
      alert('제목을 입력해주세요.');
      setIsSubmitting(false);
      return;
    }
    if (approvers.length === 0) {
      alert('결재선을 지정해주세요.');
      setIsSubmitting(false);
      return;
    }

    const reportData = {
      templateId: parseInt(templateId, 10),
      title,
      values: formValues,
      approvalLine: approvers.map(a => ({ employeeId: a.id, context: a.context || '검토' })),
      references: references.map(r => ({ employeeId: r.id })),
    };

    const formData = new FormData();
    formData.append('req', new Blob([JSON.stringify(reportData)], { type: 'application/json' }));

    if (files.length > 0) {
      files.forEach(file => {
        formData.append('files', file);
      });
    }

    try {
      const res = await axiosInstance.post(
        `${API_BASE_URL}${APPROVAL_SERVICE}/reports/category`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      if (res.status === 201) {
        alert('결재 문서가 성공적으로 상신되었습니다.');
        navigate(`/approval/reports/${res.data.data.id}`);
      } else {
        throw new Error(res.data.message || '상신에 실패했습니다.');
      }
    } catch (err) {
      console.error('Submission failed:', err);
      setError(err.response?.data?.message || err.message || '서버 오류가 발생했습니다.');
      alert(`오류: ${error}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderDynamicForm = () => {
    if (!template || !template.formSchema) {
      return null; // Don't render anything if there's no schema
    }

    return template.formSchema.map((field) => (
      <div key={field.key} className={styles.formGroup}>
        <label htmlFor={field.key}>
          {field.label}
          {field.required && <span className={styles.required}>*</span>}
        </label>
        {renderFormField(field)}
      </div>
    ));
  };

  const renderFormField = (field) => {
    switch (field.type) {
      case 'date':
        return (
          <input
            type='date'
            id={field.key}
            value={formValues[field.key] || ''}
            onChange={(e) => handleFormChange(field.key, e.target.value)}
            required={field.required}
          />
        );
      case 'textarea':
        return (
          <textarea
            id={field.key}
            value={formValues[field.key] || ''}
            onChange={(e) => handleFormChange(field.key, e.target.value)}
            required={field.required}
            placeholder={field.placeholder}
            rows={5}
          />
        );
      default:
        return (
          <input
            type='text'
            id={field.key}
            value={formValues[field.key] || ''}
            onChange={(e) => handleFormChange(field.key, e.target.value)}
            required={field.required}
            placeholder={field.placeholder}
          />
        );
    }
  };

  if (loading) {
    return <div className={styles.container}>로딩 중...</div>;
  }

  if (error) {
    return <div className={`${styles.container} ${styles.error}`}>{error}</div>;
  }

  return (
    <div className={styles.container}>
      <form className={styles.formContainer} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor='title'>제목</label>
          <input
            type='text'
            id='title'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder='결재 문서의 제목을 입력하세요.'
            required
          />
        </div>

        {renderDynamicForm()}

        <div className={styles.formGroup}>
          <label>내용</label>
          <ReactQuill theme='snow' value={content} onChange={setContent} />
        </div>

        <div className={styles.formGroup}>
          <label>결재선</label>
          <VisualApprovalLine approvalLine={approvers} mode='summary' />
          <button type="button" onClick={() => setIsApproverModalOpen(true)} className={styles.actionButton}>결재선 지정</button>
        </div>

        <div className={styles.formGroup}>
          <label>참조</label>
          {/* Simple display for references for now */}
          <div className={styles.participantDisplay}>
            {references.map(r => r.name).join(', ')}
          </div>
          <button type="button" onClick={() => setIsReferenceModalOpen(true)} className={styles.actionButton}>참조자 지정</button>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="files">첨부파일</label>
          <input type="file" id="files" multiple onChange={handleFileChange} />
          {/* Display selected files */}
          <ul>
            {files.map((file, index) => <li key={index}>{file.name}</li>)}
          </ul>
        </div>

        <div className={styles.actionButtons}>
          <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
            {isSubmitting ? '상신 중...' : '상신하기'}
          </button>
          <button type="button" className={styles.draftButton} disabled={isSubmitting}>
            임시저장
          </button>
        </div>
      </form>

      {isApproverModalOpen && (
        <EmployeeSelectModal
          open={isApproverModalOpen}
          onClose={() => setIsApproverModalOpen(false)}
          onSelect={handleSelectApprovers}
          selectedEmployees={approvers}
          multiple={true}
        />
      )}

      {isReferenceModalOpen && (
        <EmployeeSelectModal
          open={isReferenceModalOpen}
          onClose={() => setIsReferenceModalOpen(false)}
          onSelect={handleSelectReferences}
          selectedEmployees={references}
          multiple={true}
        />
      )}

      <div className={styles.debugSection}>
        <h3>Current Form Values:</h3>
        <pre>{JSON.stringify({ title, ...formValues }, null, 2)}</pre>
        <h3>Editor Content:</h3>
        <pre>{content}</pre>
        <h3>Template Data:</h3>
        <pre>{JSON.stringify(template, null, 2)}</pre>
      </div>
    </div>
  );
}

export default ApprovalNew;