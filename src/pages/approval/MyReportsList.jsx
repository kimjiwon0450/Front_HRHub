import React, { useState, useEffect } from 'react';
import axiosInstance from '../../configs/axios-config';
import DraftBoxCard from './DraftBoxCard';
import styles from './ApprovalBoxList.module.scss';
import { API_BASE_URL, APPROVAL_SERVICE } from '../../configs/host-config';

const MyReportsList = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.get(
          `${API_BASE_URL}${APPROVAL_SERVICE}/reports`,
          {
            params: {
              role: 'writer',
              status: 'IN_PROGRESS', // 'IN_PROGRESS' 상태의 문서만 요청
            },
          },
        );

        if (response.data?.statusCode === 200) {
          setReports(response.data.result.reports || []);
        } else {
          setReports([]);
          setError(response.data?.statusMessage || '진행 중인 문서를 불러오는 데 실패했습니다.');
        }
      } catch (err) {
        console.error('결재 진행함 문서를 불러오는 중 오류 발생:', err);
        setError('결재 진행함 문서를 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) {
    return <div className={styles.loading}>로딩 중...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.reportList}>
      <h3 className={styles.sectionTitle}>결재 진행함</h3>
      {reports.length > 0 ? (
        reports.map((report) => (
          <DraftBoxCard key={report.id} draft={report} />
        ))
      ) : (
        <div className={styles.noReports}>
          <div className={styles.noReportsIcon}>📄</div>
          <p>현재 진행 중인 문서가 없습니다.</p>
        </div>
      )}
    </div>
  );
};

export default MyReportsList; 