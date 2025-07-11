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
  const [content, setContent] = useState([]); // 템플릿 본문 (배열로 변경)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // isInit은 UserContext가 초기화되었는지(로컬스토리지에서 값 불러왔는지) 확인
    if (isInit && userRole !== 'ADMIN') {
      alert('접근 권한이 없습니다.');
      navigate('/approval/templates/list');
      return;
    }

    if (isEditMode) {
      const fetchTemplate = async () => {
        try {
          const res = await axiosInstance.get(
            `${API_BASE_URL}${APPROVAL_SERVICE}/templates/${templateId}`,
          );
          const template = res.data.result;
          console.log(template);
          setTitle(template.template.title);
          setDescription(template.template.description);

          // content가 문자열화된 JSON일 경우 파싱
          let parsedContent = [];
          if (
            template.template.content &&
            typeof template.template.content === 'string'
          ) {
            try {
              parsedContent = JSON.parse(template.template.content);
            } catch (error) {
              console.error('JSON 파싱 오류:', error);
              // 파싱 실패 시, 기존 문자열을 텍스트 필드로 변환
              parsedContent = [
                {
                  type: 'textarea',
                  header: '내용',
                  value: template.template.content,
                },
              ];
            }
          } else if (Array.isArray(template.template.content)) {
            parsedContent = template.template.content;
          }

          setContent(Array.isArray(parsedContent) ? parsedContent : []);
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

    const payload = { template: { title, description, content } };

    try {
      if (isEditMode) {
        await axiosInstance.put(
          `${API_BASE_URL}${APPROVAL_SERVICE}/templates/${templateId}`,
          payload,
        );
        alert('템플릿이 수정되었습니다.');
      } else {
        await axiosInstance.post(
          `${API_BASE_URL}${APPROVAL_SERVICE}/templates/create`,
          payload,
        );
        alert('새 템플릿이 생성되었습니다.');
      }
      navigate('/approval/templates/list');
    } catch (err) {
      setError(err.response?.data?.message || '처리 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addContentField = () => {
    setContent([...content, { type: 'text', header: '' }]);
  };

  const removeContentField = (index) => {
    const newContent = content.filter((_, i) => i !== index);
    setContent(newContent);
  };

  const handleContentChange = (index, field, value) => {
    const newContent = content.map((item, i) => {
      if (i === index) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setContent(newContent);
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
        <label htmlFor='title'>템플릿 제목</label>
        <input
          type='text'
          id='title'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor='description'>템플릿 설명</label>
        <textarea
          id='description'
          rows='3'
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        ></textarea>
      </div>

      <div className={styles.formGroup}>
        <label>템플릿 내용</label>
        <div className={styles.contentFieldContainer}>
          {content.map((field, index) => (
            <div key={index} className={styles.contentField}>
              <select
                value={field.type}
                onChange={(e) =>
                  handleContentChange(index, 'type', e.target.value)
                }
              >
                <option value='text'>텍스트</option>
                <option value='number'>숫자</option>
                <option value='date'>날짜</option>
                <option value='textarea'>장문 텍스트</option>
              </select>
              <input
                type='text'
                placeholder='항목 이름'
                value={field.header}
                onChange={(e) =>
                  handleContentChange(index, 'header', e.target.value)
                }
              />
              <button
                onClick={() => removeContentField(index)}
                className={styles.removeButton}
              >
                삭제
              </button>
            </div>
          ))}
          <button onClick={addContentField} className={styles.addButton}>
            항목 추가
          </button>
        </div>
      </div>

      <div className={styles.buttonGroup}>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={styles.submitButton}
        >
          {isSubmitting ? '저장 중...' : isEditMode ? '수정 완료' : '생성하기'}
        </button>
      </div>
    </div>
  );
};

export default TemplateForm;
