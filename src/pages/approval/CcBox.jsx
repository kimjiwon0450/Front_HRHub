import React, { useState, useEffect, useContext } from 'react';
import axiosInstance from '../../configs/axios-config';
import CcBoxCard from './CcBoxCard'; // DraftBoxCard 대신 CcBoxCard를 임포트
import styles from './ApprovalBoxList.module.scss'; // 재사용 가능한 스타일
import { API_BASE_URL, APPROVAL_SERVICE } from '../../configs/host-config';
import { UserContext } from '../../context/UserContext';

const CcBox = () => {
  const [ccDocs, setCcDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { userId } = useContext(UserContext);

  useEffect(() => {
    if (!userId) return;

    const fetchCcDocs = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axiosInstance.get(
          `${API_BASE_URL}${APPROVAL_SERVICE}/reports`,
          {
            params: {
              role: 'reference',
              page: 0,
              size: 10,
            },
          },
        );

        console.log('서버 응답:', res.data);

        if (res.data?.statusCode === 200) {
          const allReports = res.data.result.reports || [];
          // DRAFT, RECALLED 상태의 문서는 목록에 표시하지 않음
          const filteredReports = allReports.filter(
            (report) =>
              report.reportStatus !== 'DRAFT' &&
              report.reportStatus !== 'RECALLED',
          );
          setCcDocs(filteredReports);
        } else {
          setError(
            res.data?.statusMessage || '수신 참조 문서를 불러오지 못했습니다.',
          );
        }
      } catch (err) {
        console.error('수신 참조 문서를 불러오는 중 오류 발생:', err);
        if (err.response) {
          console.error('서버 응답 데이터:', err.response.data);
          setError(err.response.data.message || '서버 요청에 실패했습니다.');
        } else {
          setError('네트워크 오류 또는 서버 오류');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCcDocs();
  }, [userId]);

  return (
    <div className={styles.reportListContainer}>
      <h3 className={styles.sectionTitle}>수신 참조함</h3>
      <div className={styles.reportList}>
        {loading && <p>로딩 중...</p>}
        {error && <p className={styles.error}>{error}</p>}
        {!loading && !error && ccDocs.length > 0 ? (
          ccDocs.map((doc) => <CcBoxCard key={doc.id} doc={doc} />)
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
    </div>
  );
};

export default CcBox; 