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
        // 내가 '기안자' 또는 '결재자'인 모든 완료/반려 문서를 가져오기 위해 4번의 호출을 동시에 실행
        const responses = await Promise.all([
          // 내가 기안한 문서
          axiosInstance.get(`${API_BASE_URL}${APPROVAL_SERVICE}/reports`, {
            params: { role: 'writer', status: 'APPROVED', page: 0, size: 10 },
          }),
          axiosInstance.get(`${API_BASE_URL}${APPROVAL_SERVICE}/reports`, {
            params: { role: 'writer', status: 'REJECTED', page: 0, size: 10 },
          }),
          // 내가 결재한 문서
          axiosInstance.get(`${API_BASE_URL}${APPROVAL_SERVICE}/reports`, {
            params: { role: 'approver', status: 'APPROVED', page: 0, size: 10 },
          }),
          axiosInstance.get(`${API_BASE_URL}${APPROVAL_SERVICE}/reports`, {
            params: { role: 'approver', status: 'REJECTED', page: 0, size: 10 },
          }),
        ]);

        console.log('--- 완료 문서함 API 원본 응답 ---', responses.map(r => r.data));

        const allDocs = responses.flatMap(res => res.data.result?.reports || []);

        // 모든 결과를 합치고 중복을 제거한 뒤, 최신순으로 정렬합니다.
        const uniqueDocs = Array.from(new Map(allDocs.map(doc => [doc.id, doc])).values());
        
        console.log('--- 화면에 표시될 최종 완료 문서 ---', uniqueDocs);

        // --- 프론트엔드 방어 코드 ---
        // 백엔드가 status 파라미터를 무시하고 다른 상태의 문서를 보내는 버그에 대한 임시 대응
        const trulyCompletedDocs = uniqueDocs.filter(
          doc => doc.reportStatus === 'APPROVED' || doc.reportStatus === 'REJECTED'
        );
        console.log('--- 백엔드 버그 필터링 후 최종 문서 ---', trulyCompletedDocs);
        
        trulyCompletedDocs.sort((a, b) => new Date(b.createdAt || b.reportCreatedAt) - new Date(a.createdAt || a.reportCreatedAt));

        setCompletedDocs(trulyCompletedDocs);
      } catch (err) {
        console.error('완료 문서를 불러오는 중 오류 발생:', err.response?.data || err);
        setError('완료된 문서를 불러오는 데 실패했습니다.');
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