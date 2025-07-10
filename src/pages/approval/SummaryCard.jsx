import React from 'react';
import styles from './SummaryCard.module.scss';

const SummaryCard = ({ title, count, icon }) => {
  return (
    <div className={styles.summaryCard}>
      <div className={styles.cardContent}>
        <div className={styles.info}>
          <span className={styles.title}>{title}</span>
          <span className={styles.count}>{count}</span>
        </div>
        <div className={styles.iconWrapper}>
          <img src={icon} alt={title} className={styles.icon} />
        </div>
      </div>
    </div>
  );
};

export default SummaryCard; 