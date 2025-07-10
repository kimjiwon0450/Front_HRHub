import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../configs/axios-config';
import { API_BASE_URL, APPROVAL_SERVICE } from '../../configs/host-config';
import styles from './ApprovalForm.module.scss'; // 재사용
import { UserContext } from '../../context/UserContext';

const TemplateForm = () => {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const isEditMode = !!templateId;
  const { userRole, isInit } = useContext(UserContext);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState(''); // 템플릿 본문
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // isInit은 UserContext가 초기화되었는지(로컬스토리지에서 값 불러왔는지) 확인
    if (isInit && userRole !== 'ADMIN') {
      alert('접근 권한이 없습니다.');
      navigate('/approval/templates');
      return;
    }

    if (isEditMode) {
      const fetchTemplate = async () => {
        try {
          const res = await axiosInstance.get(`${API_BASE_URL}${APPROVAL_SERVICE}/templates/${templateId}`);
          const template = res.data.result;
          setTitle(template.title);
          setDescription(template.description);
          setContent(template.content);
        } catch (err) {
          setError('템플릿 정보를 불러오는 데 실패했습니다.');
        }
      };
      fetchTemplate();
    }
  }, [templateId, isEditMode, userRole, isInit, navigate]);

  const handleSubmit = async () => {
    if (!title) {
      alert('템플릿 제목을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload = { title, description, content };

    try {
      if (isEditMode) {
        await axiosInstance.put(`${API_BASE_URL}${APPROVAL_SERVICE}/templates/${templateId}`, payload);
        alert('템플릿이 수정되었습니다.');
      } else {
        await axiosInstance.post(`${API_BASE_URL}${APPROVAL_SERVICE}/templates/create`, payload);
        alert('새 템플릿이 생성되었습니다.');
      }
      navigate('/approval/templates');
    } catch (err) {
      setError(err.response?.data?.message || '처리 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // UserContext가 아직 로딩 중이면 아무것도 표시하지 않음
  if (!isInit) {
    return null;
  }

  return (
    <div className={styles.container}>
      <h2>{isEditMode ? '템플릿 수정' : '새 템플릿 작성'}</h2>
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.formGroup}>
        <label htmlFor="title">템플릿 제목</label>
        <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="description">템플릿 설명</label>
        <input type="text" id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="content">템플릿 기본 내용</label>
        <textarea id="content" rows="15" value={content} onChange={(e) => setContent(e.target.value)}></textarea>
      </div>

      <div className={styles.buttonGroup}>
        <button onClick={handleSubmit} disabled={isSubmitting} className={styles.submitButton}>
          {isSubmitting ? '저장 중...' : (isEditMode ? '수정 완료' : '생성하기')}
        </button>
      </div>
    </div>
  );
};

export default TemplateForm; 