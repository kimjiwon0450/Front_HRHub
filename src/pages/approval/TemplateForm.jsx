import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../configs/axios-config';
import { API_BASE_URL, APPROVAL_SERVICE } from '../../configs/host-config';
import styles from './TemplateForm.module.scss'; // New SCSS module needed
import { UserContext } from '../../context/UserContext';
import FieldSettingModal from '../../components/approval/FieldSettingModal';

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

  // New state for right-side settings
  const [usageStatus, setUsageStatus] = useState('Y');
  const [editorUsage, setEditorUsage] = useState('Y');
  const [attachmentRequired, setAttachmentRequired] = useState('N');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [categories, setCategories] = useState([]);

  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const [currentFieldIndex, setCurrentFieldIndex] = useState(null);

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

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axiosInstance.get(`${API_BASE_URL}${APPROVAL_SERVICE}/category`);
        setCategories(res.data?.result || []);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    fetchCategories();
  }, []);

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

  const addContentField = (type) => {
    let newField = { type: type, header: '', required: false };
    switch (type) {
        case 'text':
            newField.header = '텍스트';
            break;
        case 'date':
            newField.header = '날짜';
            break;
        case 'datetime':
            newField.header = '날짜+시간';
            break;
        case 'period':
            newField.header = '기간';
            break;
        case 'textarea':
            newField.header = '상세내용';
            break;
        default:
            newField.header = '새 항목';
    }
    setContent([...content, newField]);
};

const removeContentField = (index) => {
    const newContent = content.filter((_, i) => i !== index);
    setContent(newContent);
};

const updateContentField = (index, newFieldData) => {
    const newContent = content.map((item, i) =>
        i === index ? newFieldData : item
    );
    setContent(newContent);
};

const openFieldSettings = (index) => {
    setCurrentFieldIndex(index);
    setIsFieldModalOpen(true);
};

const closeFieldSettings = () => {
    setCurrentFieldIndex(null);
    setIsFieldModalOpen(false);
};

const handleFieldSettingsSave = (newFieldData) => {
    updateContentField(currentFieldIndex, newFieldData);
    closeFieldSettings();
};

  // UserContext가 아직 로딩 중이면 아무것도 표시하지 않음
  if (!isInit) {
    return null;
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.formBuilder}>
        <h3>등록된 입력 정보</h3>
        <div className={styles.contentFieldContainer}>
          {content.map((field, index) => (
            <div key={index} className={styles.contentField}>
              <span>{field.header || '새 항목'}</span>
              <div>
                <button
                  className={styles.settingButton}
                  onClick={() => openFieldSettings(index)}
                >
                  설정
                </button>
                <button
                  onClick={() => removeContentField(index)}
                  className={styles.removeButton}
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
         {/* This button will be removed or repurposed */}
      </div>
      <aside className={styles.settingsPanel}>
        <div className={styles.settingsSection}>
            <h4>입력항목 추가</h4>
            <div className={styles.fieldButtons}>
                <button onClick={() => addContentField('text')}>텍스트</button>
                <button onClick={() => addContentField('date')}>날짜</button>
                <button onClick={() => addContentField('datetime')}>날짜+시간</button>
                <button onClick={() => addContentField('period')}>기간</button>
                <button onClick={() => addContentField('textarea')}>상세내용</button>
            </div>
        </div>
        <div className={styles.settingsSection}>
          <h4>양식 기초설정</h4>
          <div className={styles.radioGroup}>
            <label>문서 사용여부</label>
            <div>
              <input type="radio" id="use" name="usageStatus" value="Y" checked={usageStatus === 'Y'} onChange={(e) => setUsageStatus(e.target.value)} />
              <label htmlFor="use">사용</label>
              <input type="radio" id="unuse" name="usageStatus" value="N" checked={usageStatus === 'N'} onChange={(e) => setUsageStatus(e.target.value)} />
              <label htmlFor="unuse">미사용</label>
            </div>
          </div>
          <div className={styles.radioGroup}>
            <label>편집기 사용여부</label>
            <div>
              <input type="radio" id="editorUse" name="editorUsage" value="Y" checked={editorUsage === 'Y'} onChange={(e) => setEditorUsage(e.target.value)} />
              <label htmlFor="editorUse">사용</label>
              <input type="radio" id="editorUnuse" name="editorUsage" value="N" checked={editorUsage === 'N'} onChange={(e) => setEditorUsage(e.target.value)} />
              <label htmlFor="editorUnuse">미사용</label>
            </div>
          </div>
          <div className={styles.radioGroup}>
            <label>첨부파일 필수여부</label>
            <div>
              <input type="radio" id="attachmentRequired" name="attachmentRequired" value="Y" checked={attachmentRequired === 'Y'} onChange={(e) => setAttachmentRequired(e.target.value)} />
              <label htmlFor="attachmentRequired">필수</label>
              <input type="radio" id="attachmentNotRequired" name="attachmentRequired" value="N" checked={attachmentRequired === 'N'} onChange={(e) => setAttachmentRequired(e.target.value)} />
              <label htmlFor="attachmentNotRequired">선택</label>
            </div>
          </div>
        </div>
        <div className={styles.settingsSection}>
          <h4>양식정보 입력</h4>
          <div className={styles.formGroup}>
            <label>양식명</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className={styles.formGroup}>
            <label>카테고리</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">카테고리 선택</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>양식설명</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className={styles.formGroup}>
            <label>양식태그</label>
            <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} />
          </div>
        </div>

         <div className={styles.actionButtons}>
            <button className={styles.cancelButton}>취소</button>
            <button className={styles.saveButton} onClick={handleSubmit}>저장</button>
        </div>
      </aside>
      <FieldSettingModal 
          open={isFieldModalOpen}
          onClose={closeFieldSettings}
          onSave={handleFieldSettingsSave}
          fieldData={currentFieldIndex !== null ? content[currentFieldIndex] : null}
      />
    </div>
  );
};

export default TemplateForm;
