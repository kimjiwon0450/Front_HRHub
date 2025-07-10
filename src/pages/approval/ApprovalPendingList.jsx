import React, { useEffect, useState } from 'react';
import axiosInstance from '../../configs/axios-config';
import styles from './ApprovalPendingList.module.scss';
import ApprovalPendingCard from './ApprovalPendingCard';

const ApprovalPendingList = () => {
  const [pendingReports, setPendingReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPending = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axiosInstance.get(
          '/approval-service/reports',
          {
            params: { role: 'approver', status: 'IN_PROGRESS', page: 0, size: 10 },
          }
        );
        if (res.data?.statusCode === 200) {
          setPendingReports(res.data.result.reports || []);
        } else {
          setError(res.data?.statusMessage || '결재 대기 목록을 불러오지 못했습니다.');
        }
      } catch (err) {
        console.log(err);
        setError('네트워크 오류 또는 서버 오류');
      } finally {
        setLoading(false);
      }
    };
    fetchPending();
  }, []);

  return (
    <div className={styles['approval-pending-list']}>
      <h2>결재 대기/요청</h2>
      <div className={styles['approval-pending-list-inner']}>
        {loading && <div>로딩 중...</div>}
        {error && <div className={styles['error-message']}>{error}</div>}
        {!loading && !error && pendingReports.map(report => (
          <ApprovalPendingCard key={report.id} report={report} />
        ))}
      </div>
    </div>
  );
};

export default ApprovalPendingList; 