import React, { useState } from 'react';
import styles from './CategoryModal.module.scss';

const CategoryModal = ({ open, onClose, onSubmit }) => {
  const [categoryName, setCategoryName] = useState('');
  const [description, setDescription] = useState('');
  // Color state can be added later

  if (!open) {
    return null;
  }

  const handleSubmit = () => {
    if (!categoryName) {
      alert('카테고리명을 입력해주세요.');
      return;
    }
    onSubmit({ categoryName, description });
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>카테고리 추가</h3>
          <button onClick={onClose} className={styles.closeButton}>&times;</button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.formGroup}>
            <label htmlFor="categoryName">카테고리명 *</label>
            <input
              type="text"
              id="categoryName"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="categoryDescription">카테고리 설명</label>
            <textarea
              id="categoryDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>
        </div>
        <div className={styles.modalFooter}>
          <button onClick={onClose} className={styles.cancelButton}>취소</button>
          <button onClick={handleSubmit} className={styles.submitButton}>추가</button>
        </div>
      </div>
    </div>
  );
};

export default CategoryModal; 