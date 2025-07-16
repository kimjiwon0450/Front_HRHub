import React, { useState, useEffect } from 'react';
import styles from './FrequentTemplatesModal.module.scss';
import axiosInstance from '../../configs/axios-config';
import { API_BASE_URL, APPROVAL_SERVICE } from '../../configs/host-config';

const FrequentTemplatesModal = ({ onClose, onSave }) => {
  const [allTemplates, setAllTemplates] = useState([]); // 원본 템플릿 목록
  const [filteredTemplates, setFilteredTemplates] = useState([]); // 화면에 표시될 템플릿 목록

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [selected, setSelected] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // 카테고리 목록 가져오기
        const catResponse = await axiosInstance.get(`${API_BASE_URL}${APPROVAL_SERVICE}/category`);
        setCategories(catResponse.data?.result || []);

        // 전체 템플릿 목록 가져오기 ('/templates/list' 사용)
        const tplResponse = await axiosInstance.get(`${API_BASE_URL}${APPROVAL_SERVICE}/templates/list`);
        setAllTemplates(tplResponse.data?.result || []);

      } catch (error) {
        console.error('Failed to fetch initial data:', error);
      }
    };

    const loadFrequentTemplatesFromStorage = () => {
      const stored = localStorage.getItem('frequentTemplates');
      setSelected(stored ? JSON.parse(stored) : []);
    };

    fetchInitialData();
    loadFrequentTemplatesFromStorage();
  }, []);
  
  // 필터링 로직
  useEffect(() => {
    let templates = allTemplates;

    // 1. 카테고리 필터
    if (selectedCategory) {
      templates = templates.filter(t => t.category && t.category.id === selectedCategory);
    }

    // 2. 검색어 필터
    if (searchTerm) {
      templates = templates.filter(t =>
        t.template.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredTemplates(templates);
  }, [selectedCategory, searchTerm, allTemplates]);


  const handleSelect = (templateId) => {
    setSelected(prev => 
      prev.includes(templateId) 
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  const handleSave = () => {
    onSave(selected);
    onClose();
  };

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
          </div>
          <div className={styles.mainContainer}>
            <aside className={styles.sidebar}>
              <ul className={styles.categoryList}>
                <li 
                  className={!selectedCategory ? styles.active : ''}
                  onClick={() => setSelectedCategory(null)}
                >
                  전체
                </li>
                {categories.map(cat => (
                  <li 
                    key={cat.id}
                    className={selectedCategory === cat.id ? styles.active : ''}
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    {cat.categoryName}
                  </li>
                ))}
              </ul>
            </aside>
            <main className={styles.templateSelection}>
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
                  <div key={template.templateId} className={styles.templateItem}>
                    <label>
                      <input 
                        type="checkbox" 
                        checked={selected.includes(template.templateId)}
                        onChange={() => handleSelect(template.templateId)}
                      />
                      {template.template.title}
                    </label>
                  </div>
                ))}
              </div>
            </main>
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