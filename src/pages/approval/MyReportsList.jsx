import React, { useState, useEffect, useContext } from 'react';
import axiosInstance from '../../configs/axios-config';
import { UserContext } from '../../context/UserContext';
import DraftBoxCard from './DraftBoxCard'; 
import styles from './ApprovalBoxList.module.scss'; 
import { API_BASE_URL, APPROVAL_SERVICE } from '../../configs/host-config';

const MyReportsList = () => {
  const { user } = useContext(UserContext);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      if (!user || !user.id) {
        setError("로그인이 필요합니다.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        // [수정] params에서 불필요한 userId 제거
        const response = await axiosInstance.get(
          `${API_BASE_URL}${APPROVAL_SERVICE}/reports`,
          {
            params: { role: 'writer' }, // '내가 올린 문서'를 위해 role만 전달
          }
        );

        console.log('MyReportsList - API 응답 원본:', response.data); // 1. API 응답 원본 로그
        
        if (response.data?.data?.reports) {
          setReports(response.data.data.reports);
        } else {
          setReports([]);
        }
        setError(null);
      } catch (error) {
        console.error('내가 올린 문서를 불러오는 중 오류 발생:', error);
        setError('내가 올린 문서를 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [user]); 

  if (!user || !user.id) {
    // 사용자 정보가 로드되기 전이나 로그아웃 상태일 때 보여줄 UI
    return (
       <div className={styles.reportList}>
        <h3 className={styles.sectionTitle}>내가 올린 최신 문서</h3>
        <div className={styles.noReports}>
          <div className={styles.noReportsIcon}>🔒</div>
          <p>로그인 후 문서를 확인할 수 있습니다.</p>
        </div>
      </div>
    )
  }

  const groupReportsByDate = (reports) => {
    return reports.reduce((acc, report) => {
      const date = new Date(report.createdAt).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      });
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(report);
      return acc;
    }, {});
  };

  if (loading) {
    return <div className={styles.loading}>로딩 중...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }
  
  const groupedReports = groupReportsByDate(reports);

  return (
    <div className={styles.reportList}>
      <h3 className={styles.sectionTitle}>내가 올린 최신 문서</h3>
      {reports.length > 0 ? (
        Object.entries(groupedReports).map(([date, reportsOnDate]) => (
          <div key={date} className={styles.dateGroup}>
            <div className={styles.dateHeader}>{date}</div>
            {reportsOnDate
              .filter(report => report && report.id) // report 객체와 id가 유효한 항목만 필터링
              .map((report) => {
                // 2. 카드에 전달 직전 로그
                console.log('MyReportsList - map 내부 report 객체:', report); 
                return <DraftBoxCard key={report.id} draft={report} />;
              })}
          </div>
        ))
      ) : (
        <div className={styles.noReports}>
          <div className={styles.noReportsIcon}>📄</div>
          <p>최근에 올린 문서가 없습니다.</p>
        </div>
      )}
    </div>
  );
};

export default MyReportsList; 