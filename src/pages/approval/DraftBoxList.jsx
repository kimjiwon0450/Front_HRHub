import React, { useState, useEffect } from 'react';
import axiosInstance from '../../configs/axios-config';
import DraftBoxCard from './DraftBoxCard';
import styles from './DraftBoxList.module.scss';
import { API_BASE_URL, APPROVAL_SERVICE } from '../../configs/host-config';

const DraftBoxList = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchByStatus = (status) =>
          axiosInstance.get(`${API_BASE_URL}${APPROVAL_SERVICE}/reports`, {
            params: {
              role: 'writer',
              status,
              page: 0,
              size: 10,
            },
          });

        const [draftRes, recalledRes] = await Promise.all([
          fetchByStatus('DRAFT'),
          fetchByStatus('RECALLED'),
        ]);

        const drafts = draftRes.data?.result?.reports || [];
        const recalled = recalledRes.data?.result?.reports || [];

        const combinedReports = [...drafts, ...recalled].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );

        setReports(combinedReports);
      } catch (err) {
        console.error(err);
        setError('네트워크 오류 또는 서버 오류');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  return (
    <div className={styles.container}>
      <h2>임시 저장함</h2>
      <div className={styles.list}>
        {loading && <p>로딩 중...</p>}
        {error && <p className={styles.error}>{error}</p>}
        {!loading && !error && reports.length > 0 ? (
          reports.map((report) => (
            <DraftBoxCard key={report.id} draft={report} />
          ))
        ) : (
          !loading && !error && <p>임시 저장된 문서가 없습니다.</p>
        )}
      </div>
    </div>
  );
};

export default DraftBoxList;