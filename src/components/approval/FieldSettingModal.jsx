import React, { useState, useEffect } from 'react';
import styles from './CategoryModal.module.scss'; // Reuse styles for now

const FieldSettingModal = ({ open, onClose, onSave, fieldData }) => {
  const [label, setLabel] = useState('');
  const [required, setRequired] = useState(false);

  useEffect(() => {
    if (fieldData) {
      setLabel(fieldData.header || '');
      setRequired(fieldData.required || false);
    }
  }, [fieldData]);

  if (!open) {
    return null;
  }

  const handleSave = () => {
    onSave({ ...fieldData, header: label, required });
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>입력 항목 설정</h3>
          <button onClick={onClose} className={styles.closeButton}>&times;</button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.formGroup}>
            <label htmlFor="fieldName">정보명</label>
            <input
              type="text"
              id="fieldName"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </div>
          <div className={styles.formGroup}>
            <label>필수 여부</label>
            <div>
                <input type="checkbox" id="required" checked={required} onChange={(e) => setRequired(e.target.checked)} />
                <label htmlFor="required">필수 항목으로 지정</label>
            </div>
          </div>
        </div>
        <div className={styles.modalFooter}>
          <button onClick={onClose} className={styles.cancelButton}>취소</button>
          <button onClick={handleSave} className={styles.submitButton}>저장</button>
        </div>
      </div>
    </div>
  );
};

export default FieldSettingModal; 