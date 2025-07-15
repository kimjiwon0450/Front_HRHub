import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../configs/axios-config';
import { API_BASE_URL, APPROVAL_SERVICE } from '../../configs/host-config';
import styles from './TemplateForm.module.scss';
import { UserContext } from '../../context/UserContext';
import FieldSettingModal from '../../components/approval/FieldSettingModal';
import DefaultFieldSettingModal from '../../components/approval/DefaultFieldSettingModal';
import ReactQuill from '@adrianhelvik/react-quill';
import 'react-quill/dist/quill.snow.css'; // for snow theme

const TemplateForm = () => {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const isEditMode = !!templateId;
  const { userRole, isInit } = useContext(UserContext);

  // 우측 패널 상태: 'settings' 또는 'fields'
  const [rightPanelMode, setRightPanelMode] = useState('settings'); 

  // --- Left Pane State ---
  // 템플릿 본문 (WYSIWYG 에디터)
  const [editorContent, setEditorContent] = useState('');
  // 동적 입력 필드 목록
  const [dynamicFields, setDynamicFields] = useState([]);
  
  // --- Right Pane State ---
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [usageStatus, setUsageStatus] = useState('Y');
  const [editorUsage, setEditorUsage] = useState('Y');
  const [attachmentRequired, setAttachmentRequired] = useState('N');
  const [categoryId, setCategoryId] = useState('');
  const [tags, setTags] = useState('');
  
  // --- Global State ---
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // Custom Field Modal State
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const [currentFieldIndex, setCurrentFieldIndex] = useState(null);
  
  // Default Field Modal State
  const [isDefaultFieldModalOpen, setIsDefaultFieldModalOpen] = useState(false);
  const [currentDefaultFieldIndex, setCurrentDefaultFieldIndex] = useState(null);


  // 고정 기본 항목 (UI 표시용) -> 이제 state로 관리
  const [defaultFields, setDefaultFields] = useState([
    { id: 'title', label: '제목', description: '결재문서의 제목입니다.', isDefault: true, enabled: true },
    { id: 'recipient', label: '수신참조', description: '결재정보를 공유할 참조자입니다.', isDefault: true, enabled: true },
    { id: 'ref_doc', label: '참조문서', description: '관련 결재문서를 첨부합니다.', isDefault: true, enabled: true },
    { id: 'enforcer', label: '시행자(다수)', description: '결재문서의 시행자입니다.', isDefault: true, enabled: true },
  ]);

  useEffect(() => {
    if (isInit && userRole !== 'ADMIN') {
      alert('접근 권한이 없습니다.');
      navigate('/approval/admin/templates');
      return;
    }

    if (isEditMode) {
      const fetchTemplate = async () => {
        try {
          const res = await axiosInstance.get(
            `${API_BASE_URL}${APPROVAL_SERVICE}/templates/${templateId}`,
          );
          const t = res.data.result.template;
          
          setTitle(t.title);
          setDescription(t.description);
          setUsageStatus(t.status || 'Y');
          setEditorUsage(t.useEditor || 'Y');
          setAttachmentRequired(t.requireAttachment || 'N');
          setCategoryId(res.data.result.categoryId || '');
          setTags(t.tags ? t.tags.join(', ') : '');
          
          // content는 이제 dynamicFields와 editorContent로 분리
          let parsedContent = [];
          if (t.content && typeof t.content === 'string') {
            try {
              parsedContent = JSON.parse(t.content);
            } catch {
              parsedContent = [];
            }
          } else if (Array.isArray(t.content)) {
            parsedContent = t.content;
          }

          // 에디터 컨텐츠와 동적 필드 분리
          const editorField = parsedContent.find(f => f.type === 'editor');
          setEditorContent(editorField ? editorField.value : '');
          setDynamicFields(parsedContent.filter(f => f.type !== 'editor'));

          // 저장된 defaultFields 정보가 있다면 업데이트 (백엔드에 저장이 필요)
          if (t.defaultFields) {
            setDefaultFields(JSON.parse(t.defaultFields));
          }

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
        if (!isEditMode && res.data?.result?.length > 0) {
          setCategoryId(res.data.result[0].categoryId);
        }
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    fetchCategories();
  }, [isEditMode]);

  const handleSubmit = async () => {
    if (!title) {
      alert('양식명을 입력해주세요.');
      return;
    }
    if (!categoryId) {
        alert('카테고리를 선택해주세요.');
        return;
    }

    setIsSubmitting(true);
    setError(null);
    
    // 에디터 내용을 content 배열에 다시 포함
    const editorField = { type: 'editor', value: editorContent };
    const combinedContent = [...dynamicFields, editorField];

    const payload = { 
      categoryId: categoryId,
      template: { 
        title, 
        description, 
        content: JSON.stringify(combinedContent), // content는 JSON 문자열로
        tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
        status: usageStatus,
        useEditor: editorUsage,
        requireAttachment: attachmentRequired,
        defaultFields: JSON.stringify(defaultFields) // defaultFields 정보도 저장
      } 
    };

    console.log('Submitting payload:', payload);

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
      navigate('/approval/admin/templates');
    } catch (err) {
      setError(err.response?.data?.message || '처리 중 오류가 발생했습니다.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addContentField = (type) => {
    let newField = { type: type, header: '', required: false, description: '' };
    switch (type) {
        case 'text': newField.header = '텍스트'; break;
        case 'date': newField.header = '날짜(년.월.일)'; break;
        case 'month': newField.header = '날짜(년.월)'; break;
        case 'period': newField.header = '기간'; break;
        case 'textarea': newField.header = '여러 줄 텍스트'; break;
        case 'number': newField.header = '숫자'; break;
        case 'signature': newField.header = '서명'; break;
        default: newField.header = '새 항목';
    }
    setDynamicFields([...dynamicFields, newField]);
    setRightPanelMode('settings'); // 필드 추가 후 설정 패널로 복귀
  };

  const removeContentField = (index) => {
    setDynamicFields(dynamicFields.filter((_, i) => i !== index));
  };

  const updateContentField = (index, newFieldData) => {
    setDynamicFields(dynamicFields.map((item, i) => (i === index ? newFieldData : item)));
  };

  const openFieldSettings = (index) => {
    setCurrentFieldIndex(index);
    setIsFieldModalOpen(true);
  };
  
  // --- Default Field Handlers ---
  const openDefaultFieldSettings = (index) => {
    setCurrentDefaultFieldIndex(index);
    setIsDefaultFieldModalOpen(true);
  };

  const handleDefaultFieldSettingsSave = (newFieldData) => {
    setDefaultFields(defaultFields.map((field, i) => i === currentDefaultFieldIndex ? newFieldData : field));
    setIsDefaultFieldModalOpen(false);
  };

  const toggleDefaultFieldEnabled = (index) => {
    const newFields = [...defaultFields];
    newFields[index].enabled = !newFields[index].enabled;
    setDefaultFields(newFields);
  }

  if (!isInit) return null;

  const renderRightPanel = () => {
    if (rightPanelMode === 'fields') {
      return (
        <div className={styles.settingsSection}>
          <h4>입력항목 추가</h4>
          <p>양식에 추가할 항목을 선택하세요.</p>
          <div className={styles.fieldButtons}>
              <button onClick={() => addContentField('text')}>텍스트</button>
              <button onClick={() => addContentField('textarea')}>여러 줄 텍스트</button>
              <button onClick={() => addContentField('number')}>숫자</button>
              <button onClick={() => addContentField('month')}>날짜(년.월)</button>
              <button onClick={() => addContentField('date')}>날짜(년.월.일)</button>
              <button onClick={() => addContentField('period')}>기간</button>
              <button onClick={() => addContentField('signature')}>서명</button>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className={styles.settingsSection}>
          <h4>양식 기초설정</h4>
          {/* ... Radio buttons for usageStatus, editorUsage, attachmentRequired */}
          <div className={styles.formGroup}>
            <label>문서 사용여부</label>
            <div className={styles.radioGroup}>
              <input type="radio" id="useY" name="usageStatus" value="Y" checked={usageStatus === 'Y'} onChange={e => setUsageStatus(e.target.value)} /><label htmlFor="useY">사용</label>
              <input type="radio" id="useN" name="usageStatus" value="N" checked={usageStatus === 'N'} onChange={e => setUsageStatus(e.target.value)} /><label htmlFor="useN">미사용</label>
            </div>
          </div>
          <div className={styles.formGroup}>
            <label>Editor 사용여부</label>
            <div className={styles.radioGroup}>
              <input type="radio" id="editorY" name="editorUsage" value="Y" checked={editorUsage === 'Y'} onChange={e => setEditorUsage(e.target.value)} /><label htmlFor="editorY">사용</label>
              <input type="radio" id="editorN" name="editorUsage" value="N" checked={editorUsage === 'N'} onChange={e => setEditorUsage(e.target.value)} /><label htmlFor="editorN">미사용</label>
            </div>
          </div>
          <div className={styles.formGroup}>
            <label>첨부파일 필수</label>
             <div className={styles.radioGroup}>
                <input type="radio" id="attachY" name="attachmentRequired" value="Y" checked={attachmentRequired === 'Y'} onChange={e => setAttachmentRequired(e.target.value)} /><label htmlFor="attachY">필수</label>
                <input type="radio" id="attachN" name="attachmentRequired" value="N" checked={attachmentRequired === 'N'} onChange={e => setAttachmentRequired(e.target.value)} /><label htmlFor="attachN">미필수</label>
            </div>
          </div>
        </div>
        <div className={styles.settingsSection}>
          <h4>양식 상세 정보</h4>
           <div className={styles.formGroup}>
            <label htmlFor="templateTitle">* 양식명</label>
            <input type="text" id="templateTitle" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="양식명을 입력하세요" />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="templateCategory">* 카테고리</label>
            <select id="templateCategory" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="" disabled>카테고리를 선택하세요</option>
              {categories.map(cat => (
                <option key={cat.categoryId} value={cat.categoryId}>{cat.categoryName}</option>
              ))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="templateDesc">양식설명</label>
            <textarea id="templateDesc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="양식에 대한 설명을 입력하세요"></textarea>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="templateTags">양식태그</label>
            <input type="text" id="templateTags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="쉼표(,)로 태그를 구분하세요" />
          </div>
        </div>
      </>
    );
  };

  return (
    <div className={styles.pageWrapper}>
      <header className={styles.pageHeader}>
        <h2>문서양식관리</h2>
        <button onClick={() => navigate('/approval/admin/templates')}>목록으로</button>
      </header>
      <main className={styles.mainLayout}>
        <div className={styles.leftPane}>
          <div className={styles.fieldList}>
            <div className={styles.fieldListHeader}>
              <p>
                등록된 입력정보(제목, 수신참조, 참조문서, 시행자(다수))는 기본항목으로 삭제 및 수정이 불가합니다.
              </p>
            </div>
            {defaultFields.map((field, index) => (
              <div key={field.id} className={`${styles.formField} ${styles.defaultField}`}>
                 <div className={styles.fieldInfo}>
                  <span className={styles.fieldLabel}>{field.label}</span>
                  <p className={styles.fieldDescription}>{field.description}</p>
                </div>
                <div className={styles.fieldActions}>
                  <button className={styles.actionButton} onClick={() => openDefaultFieldSettings(index)}>정보명 변경</button>
                  <label className={styles.toggleSwitch}>
                      <input type="checkbox" checked={field.enabled} onChange={() => toggleDefaultFieldEnabled(index)} />
                      <span className={styles.slider}></span>
                  </label>
                </div>
              </div>
            ))}
             {dynamicFields.map((field, index) => (
              <div key={index} className={styles.formField}>
                <div className={styles.fieldInfo}>
                  <span className={styles.fieldLabel}>{field.header}</span>
                </div>
                <div className={styles.fieldActions}>
                  <button className={styles.actionButton} onClick={() => openFieldSettings(index)}>수정</button>
                  <button className={`${styles.actionButton} ${styles.deleteButton}`} onClick={() => removeContentField(index)}>삭제</button>
                   <label className={styles.toggleSwitch}>
                      <input type="checkbox" defaultChecked />
                      <span className={styles.slider}></span>
                  </label>
                </div>
              </div>
            ))}
            <button className={styles.addFieldButton} onClick={() => setRightPanelMode('fields')}>+ 입력정보 추가</button>
          </div>
          {editorUsage === 'Y' && (
            <div className={styles.editorContainer}>
              <ReactQuill 
                theme="snow" 
                value={editorContent} 
                onChange={setEditorContent} 
                className={styles.quillEditor}
              />
            </div>
          )}
        </div>
        <aside className={styles.rightPane}>
          {renderRightPanel()}
        </aside>
      </main>
      <footer className={styles.pageActions}>
        <button className={styles.cancelButton} onClick={() => navigate('/approval/admin/templates')}>취소</button>
        <button className={styles.saveButton} onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? '저장 중...' : '저장'}
        </button>
      </footer>

      {isFieldModalOpen && currentFieldIndex !== null && (
        <FieldSettingModal 
          isOpen={isFieldModalOpen}
          onClose={() => setIsFieldModalOpen(false)}
          fieldData={dynamicFields[currentFieldIndex]}
          onSave={(newFieldData) => {
            updateContentField(currentFieldIndex, newFieldData);
            setIsFieldModalOpen(false);
          }}
        />
      )}

      {isDefaultFieldModalOpen && currentDefaultFieldIndex !== null && (
        <DefaultFieldSettingModal
          isOpen={isDefaultFieldModalOpen}
          onClose={() => setIsDefaultFieldModalOpen(false)}
          fieldData={defaultFields[currentDefaultFieldIndex]}
          onSave={handleDefaultFieldSettingsSave}
        />
      )}
    </div>
  );
};

export default TemplateForm;
