import React from 'react';
import styles from './ApprovalNew.module.scss'; // 동일한 스타일 사용

const FormField = ({ field, value, onChange }) => {
  const renderField = () => {
    switch (field.type) {
      case 'date':
      case 'date_ymd':
        return (
          <input
            type="date"
            id={field.id}
            value={value[field.id] || ''}
            onChange={(e) => onChange(field.id, e.target.value)}
            required={field.required}
            className={styles.formInput}
          />
        );
      case 'period':
        // 기간 타입은 두 개의 값을 사용하므로, value가 객체라고 가정합니다.
        return (
          <div className={styles.periodContainer}>
            <input
              type="date"
              id={`${field.id}_start`}
              value={value?.[`${field.id}_start`] || ''}
              onChange={(e) => onChange(`${field.id}_start`, e.target.value)}
              required={field.required}
              className={styles.formInput}
            />
            <span>~</span>
            <input
              type="date"
              id={`${field.id}_end`}
              value={value?.[`${field.id}_end`] || ''}
              onChange={(e) => onChange(`${field.id}_end`, e.target.value)}
              required={field.required}
              className={styles.formInput}
            />
          </div>
        );
      case 'textarea':
        return (
          <textarea
            id={field.id}
            value={value[field.id] || ''}
            onChange={(e) => onChange(field.id, e.target.value)}
            required={field.required}
            placeholder={field.description}
            rows={5}
            className={styles.formInput}
          />
        );
      default: // 'text', 'number' 등
        return (
          <input
            type={field.type === 'number' ? 'number' : 'text'}
            id={field.id}
            value={value[field.id] || ''}
            onChange={(e) => onChange(field.id, e.target.value)}
            required={field.required}
            placeholder={field.description}
            className={styles.formInput}
          />
        );
    }
  };

  return (
    <div className={styles.formRow}>
      <div className={styles.formLabel}>
        {field.header || field.label}
        {field.required && <span className={styles.required}>*</span>}
      </div>
      <div className={styles.formField}>{renderField()}</div>
    </div>
  );
};

export default FormField; 