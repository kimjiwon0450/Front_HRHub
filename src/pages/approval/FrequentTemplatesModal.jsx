import React, { useState, useEffect } from 'react';
import styles from './FrequentTemplatesModal.module.scss';
import axiosInstance from '../../configs/axios-config';

const FrequentTemplatesModal = ({ onClose, onSave }) => {
  const [templates, setTemplates] = useState([]);
  const [selected, setSelected] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // 모든 양식 템플릿을 불러옵니다.
    const fetchTemplates = async () => {
      try {
        const response = await axiosInstance.get('/approvals/templates/list');
        setTemplates(response.data);
      } catch (error) {
        console.error('Failed to fetch templates:', error);
      }
    };
    // 현재 자주 쓰는 양식 설정을 불러옵니다. (API 구현 필요)
    const fetchFrequentTemplates = async () => {
        // const response = await axiosInstance.get('/approvals/frequent-templates');
        // setSelected(response.data.map(t => t.id));
        setSelected(['template1', 'template3']); // 임시 데이터
    }

    fetchTemplates();
    fetchFrequentTemplates();
  }, []);

  const handleSelect = (templateId) => {
    setSelected(prev => 
      prev.includes(templateId) 
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  const handleSave = () => {
    // 변경된 자주 쓰는 양식 설정을 저장합니다. (API 구현 필요)
    // await axiosInstance.post('/approvals/frequent-templates', { templateIds: selected });
    onSave(selected);
    onClose();
  };

  const filteredTemplates = templates.filter(t => 
    t.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3>자주 쓰는 결재 양식 설정</h3>
          <button onClick={onClose} className={styles.closeButton}>&times;</button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.infoText}>
            <p>자주 쓰는 결재 양식을 추가하여 홈 화면에 바로가기를 추가합니다.</p>
            <p>자주 쓰는 결재 순서를 변경해보세요. 최대 10개까지 지정 가능하며, 기본은 사용량이 많은 결재양식 순으로 반영됩니다.</p>
          </div>
          <div className={styles.searchBar}>
            <input 
              type="text" 
              placeholder="양식명을 검색하세요"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className={styles.templateList}>
            {filteredTemplates.map(template => (
              <div key={template.id} className={styles.templateItem}>
                <label>
                  <input 
                    type="checkbox" 
                    checked={selected.includes(template.id)}
                    onChange={() => handleSelect(template.id)}
                  />
                  {template.title}
                </label>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.modalFooter}>
          <button onClick={onClose} className={styles.cancelButton}>취소</button>
          <button onClick={handleSave} className={styles.saveButton}>저장</button>
        </div>
      </div>
    </div>
  );
};

export default FrequentTemplatesModal; 