import React, { useState, useEffect, useCallback } from 'react';
import styles from './TemplateAdminPage.module.scss';
import axiosInstance from '../../configs/axios-config';
import { API_BASE_URL, APPROVAL_SERVICE } from '../../configs/host-config';
import CategoryModal from '../../components/approval/CategoryModal';
import { useNavigate } from 'react-router-dom';

const TemplateAdminPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [templatesError, setTemplatesError] = useState(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`${API_BASE_URL}${APPROVAL_SERVICE}/category`);
      setCategories(res.data?.result || []);
    } catch (err) {
      setError('카테고리 목록을 불러오는 데 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setTemplatesLoading(true);
        const params = {};
        if (selectedCategory) {
          params.categoryId = selectedCategory;
        }
        const res = await axiosInstance.get(`${API_BASE_URL}${APPROVAL_SERVICE}/templates/list`, { params });
        setTemplates(res.data?.result || []);
      } catch (err) {
        setTemplatesError('양식 목록을 불러오는 데 실패했습니다.');
        console.error(err);
      } finally {
        setTemplatesLoading(false);
      }
    };
    fetchTemplates();
  }, [selectedCategory]);

  const handleAddCategory = async (categoryData) => {
    try {
      await axiosInstance.post(`${API_BASE_URL}${APPROVAL_SERVICE}/category/create`, categoryData);
      alert('카테고리가 추가되었습니다.');
      setIsModalOpen(false);
      fetchCategories(); // Refresh list
    } catch (err) {
      alert('카테고리 추가에 실패했습니다.');
      console.error(err);
    }
  };

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  return (
    <div className={styles.pageContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h4>카테고리</h4>
        </div>
        <ul className={styles.categoryList}>
          {loading && <li>로딩 중...</li>}
          {error && <li className={styles.error}>{error}</li>}
          {!loading && !error && (
            <>
              <li 
                className={`${styles.categoryItem} ${selectedCategory === null ? styles.active : ''}`}
                onClick={() => handleCategoryClick(null)}
              >
                전체
              </li>
              {categories.map(cat => (
                <li 
                  key={cat.categoryId} 
                  className={`${styles.categoryItem} ${selectedCategory === cat.categoryId ? styles.active : ''}`}
                  onClick={() => handleCategoryClick(cat.categoryId)}
                >
                  {cat.categoryName}
                </li>
              ))}
            </>
          )}
          {!loading && !error && categories.length === 0 && (
              <li>카테고리가 없습니다.</li>
          )}
        </ul>
        <button onClick={() => setIsModalOpen(true)} className={styles.addCategoryButton}>+ 카테고리 추가</button>
      </aside>
      <main className={styles.mainContent}>
        <div className={styles.mainHeader}>
          <h2>문서양식관리</h2>
          <p>결재양식을 생성하고 관리합니다.</p>
        </div>
        <div className={styles.controls}>
            <div className={styles.actions}>
              <button className={styles.addButton} onClick={() => navigate('/approval/templates/form')}>+ 양식 추가하기</button>
            </div>
        </div>
        <div className={styles.templateListContainer}>
            {templatesLoading && <p>로딩 중...</p>}
            {templatesError && <p className={styles.error}>{templatesError}</p>}
            {!templatesLoading && !templatesError && templates.map(template => (
              <div key={template.id} className={styles.templateItem}>
                {/* This will be replaced by a TemplateListItem component */}
                <span>{template.templateName}</span>
                <span>{template.description}</span>
                <button>사용</button>
              </div>
            ))}
        </div>
      </main>
      <CategoryModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddCategory}
      />
    </div>
  );
};

export default TemplateAdminPage; 