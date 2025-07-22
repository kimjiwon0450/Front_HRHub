import React, { useState, useEffect } from 'react';
import axiosInstance from '../../configs/axios-config';
import DraftBoxCard from './DraftBoxCard';
import styles from './DraftBoxList.module.scss';
import { API_BASE_URL, APPROVAL_SERVICE } from '../../configs/host-config';
import ReportFilter from '../../components/approval/ReportFilter';
import { useReportFilter } from '../../hooks/useReportFilter';

const DraftBoxList = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // 필터링 훅 사용
  const { filteredReports, handleFilterChange } = useReportFilter(reports);

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
              sortBy: 'reportCreatedAt',
              sortOrder: 'desc',
              page: 0,
              size: 50,
            },
          });

        const [draftRes, recalledRes] = await Promise.all([
          fetchByStatus('DRAFT'),
          fetchByStatus('RECALLED'),
        ]);

        const drafts = draftRes.data?.result?.reports || [];
        const recalled = recalledRes.data?.result?.reports || [];

        const combinedReports = [...drafts, ...recalled].sort(
          (a, b) => new Date(b.reportCreatedAt) - new Date(a.reportCreatedAt),
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
      <h2>임시 저장 문서함</h2>
      
      {/* 필터링 컴포넌트 */}
      <ReportFilter onFilterChange={handleFilterChange} />
      
      <div className={styles.list}>
        {loading && <p>로딩 중...</p>}
        {error && <p className={styles.error}>{error}</p>}
        {!loading && !error && filteredReports.length > 0 ? (
          <>
            <div className={styles.resultInfo}>
              총 {filteredReports.length}건의 문서가 있습니다.
            </div>
            {filteredReports.map((report) => (
              <DraftBoxCard key={report.id} draft={report} />
            ))}
          </>
        ) : (
          !loading && !error && <p>임시 저장된 문서가 없습니다.</p>
        )}
      </div>
    </div>
  );
};

export default DraftBoxList;