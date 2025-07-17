import React from 'react';
import styles from './AddFieldModal.module.scss';

const AddFieldModal = ({ isOpen, onClose, onSelect }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <h2>양식 입력방식 추가</h2>
        <p className={styles.description}>추가할 정보의 종류를 선택해주세요.</p>
        
        <div className={styles.selectionContainer}>
          <div className={styles.selectionBox} onClick={() => onSelect('custom')}>
            <h3>사용자 설정 선택</h3>
            <p>텍스트, 숫자, 날짜 등 필요에 맞는 입력 항목을 직접 설정합니다.</p>
            <button>선택</button>
          </div>
        </div>

        <div className={styles.modalActions}>
          <button className={styles.closeButton} onClick={onClose}>닫기</button>
        </div>
      </div>
    </div>
  );
};

export default AddFieldModal; 