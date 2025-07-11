import React, { useState, useEffect } from 'react';
import axiosInstance from '../../configs/axios-config';
import DraftBoxCard from './DraftBoxCard'; // 재사용 가능한 카드 컴포넌트
import styles from './ApprovalBoxList.module.scss'; // 재사용 가능한 스타일
import { API_BASE_URL, APPROVAL_SERVICE } from '../../configs/host-config';

const CcBox = () => {
  const [ccDocs, setCcDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCcDocs = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axiosInstance.get(
          `${API_BASE_URL}${APPROVAL_SERVICE}/reports`,
          {
            params: {
              role: 'referrer', // 내가 참조자로 지정된 문서
              page: 0,
              size: 10,
            },
          },
        );

        if (res.data?.statusCode === 200) {
          setCcDocs(res.data.result.reports || []);
        } else {
          setError(
            res.data?.statusMessage || '수신 참조 문서를 불러오지 못했습니다.',
          );
        }
      } catch (err) {
        console.error('수신 참조 문서를 불러오는 중 오류 발생:', err);
        setError('네트워크 오류 또는 서버 오류');
      } finally {
        setLoading(false);
      }
    };

    fetchCcDocs();
  }, []);

  return (
    <div className={styles.reportList}>
      <h3 className={styles.sectionTitle}>수신 참조함</h3>
      {loading && <p>로딩 중...</p>}
      {error && <p className={styles.error}>{error}</p>}
      {!loading && !error && ccDocs.length > 0 ? (
        ccDocs.map((doc) => <DraftBoxCard key={doc.id} draft={doc} />)
      ) : (
        !loading &&
        !error && (
          <div className={styles.noReports}>
            <div className={styles.noReportsIcon}>📧</div>
            <p>수신 참조된 문서가 없습니다.</p>
          </div>
        )
      )}
    </div>
  );
};

export default CcBox; 