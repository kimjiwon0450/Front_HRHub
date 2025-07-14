import React, { useEffect, useState } from 'react';
import axiosInstance from '../../configs/axios-config';
import styles from './ApprovalPendingList.module.scss';
import ApprovalPendingCard from './ApprovalPendingCard';
import { API_BASE_URL, APPROVAL_SERVICE } from '../../configs/host-config';

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
          `${API_BASE_URL}${APPROVAL_SERVICE}/reports`,
          {
            params: {
              role: 'approver', // '내가 결재할 차례인 문서'를 의미
              status: 'IN_PROGRESS', // 반려/완료된 문서를 제외하기 위해 반드시 필요
              page: 0,
              size: 10,
            },
          },
        );
        if (res.data?.statusCode === 200) {
          const allReports = res.data.result.reports || [];
          // 이중 필터링: API가 IN_PROGRESS 외 다른 상태를 보내주는 경우를 대비
          const filteredReports = allReports.filter(
            (report) => report.reportStatus === 'IN_PROGRESS',
          );
          setPendingReports(filteredReports);
        } else {
          setError(
            res.data?.statusMessage ||
              '결재할 문서를 불러오는 데 실패했습니다.',
          );
        }
      } catch (err) {
        console.error(err);
        setError('네트워크 오류 또는 서버 오류');
      } finally {
        setLoading(false);
      }
    };
    fetchPending();
  }, []);

  return (
    <div className={styles.container}>
      <h2>결재할 문서</h2>
      <div className={styles.list}>
        {loading && <p>로딩 중...</p>}
        {error && <p className={styles.error}>{error}</p>}
        {!loading && !error && pendingReports.length > 0 ? (
          pendingReports.map((report) => (
            <ApprovalPendingCard key={report.id} report={report} />
          ))
        ) : (
          !loading && !error && <p>결재할 문서가 없습니다.</p>
        )}
      </div>
    </div>
  );
};

export default ApprovalPendingList; 