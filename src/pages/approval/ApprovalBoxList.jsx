import React, { useState, useEffect, useContext } from 'react';
import axiosInstance from '../../configs/axios-config';
import { UserContext } from '../../context/UserContext';
import ApprovalBoxCard from './ApprovalBoxCard';
import styles from './ApprovalBoxList.module.scss';

const ApprovalBoxList = () => {
  const { user } = useContext(UserContext);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      if (!user || !user.id) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await axiosInstance.get('/approvals/received');
        setReports(response.data);
        console.log(response.data);
        setError(null);
      } catch (error) {
        console.error('결재 문서를 불러오는 중 오류 발생:', error);
        setError('결재 문서를 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [user]);

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
      <h3 className={styles.sectionTitle}>결재 요청</h3>
      {reports.length > 0 ? (
        Object.entries(groupedReports).map(([date, reportsOnDate]) => (
          <div key={date} className={styles.dateGroup}>
            <div className={styles.dateHeader}>{date}</div>
            {reportsOnDate.map((report) => (
              <ApprovalBoxCard key={report.id} report={report} />
            ))}
          </div>
        ))
      ) : (
        <div className={styles.noReports}>
          <div className={styles.noReportsIcon}>📂</div>
          <p>결재할 문서가 없습니다.</p>
        </div>
      )}
    </div>
  );
};

export default ApprovalBoxList; 