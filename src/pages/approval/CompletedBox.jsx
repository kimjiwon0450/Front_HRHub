import React, { useState, useEffect } from 'react';
import axiosInstance from '../../configs/axios-config';
import DraftBoxCard from './DraftBoxCard'; // 재사용 가능한 카드 컴포넌트
import styles from './ApprovalBoxList.module.scss'; // 재사용 가능한 스타일
import { API_BASE_URL, APPROVAL_SERVICE } from '../../configs/host-config';

const CompletedBox = () => {
  const [completedDocs, setCompletedDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompletedDocs = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axiosInstance.get(
          `${API_BASE_URL}${APPROVAL_SERVICE}/reports`,
          {
            params: {
              role: 'all', // 내가 기안 또는 결재한 모든 문서
              status: 'APPROVED,REJECTED', // 완료된 상태 (승인, 반려)
              page: 0,
              size: 10,
            },
          },
        );

        if (res.data?.statusCode === 200) {
          setCompletedDocs(res.data.result.reports || []);
        } else {
          setError(
            res.data?.statusMessage ||
              '완료된 문서를 불러오는 데 실패했습니다.',
          );
        }
      } catch (err) {
        console.error(err);
        setError('네트워크 오류 또는 서버 오류');
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedDocs();
  }, []);

  return (
    <div className={styles.reportList}>
      <h3 className={styles.sectionTitle}>완료 문서함</h3>
      {loading && <p>로딩 중...</p>}
      {error && <p className={styles.error}>{error}</p>}
      {!loading && !error && completedDocs.length > 0 ? (
        completedDocs.map((doc) => <DraftBoxCard key={doc.id} draft={doc} />)
      ) : (
        !loading &&
        !error && (
          <div className={styles.noReports}>
            <div className={styles.noReportsIcon}>🗂️</div>
            <p>완료된 문서가 없습니다.</p>
          </div>
        )
      )}
    </div>
  );
};

export default CompletedBox; 