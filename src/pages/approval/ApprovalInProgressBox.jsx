import React, { useEffect, useState } from 'react';
import axiosInstance from '../../configs/axios-config';
import DraftBoxCard from './DraftBoxCard'; // 재사용 가능한 카드 컴포넌트
import styles from './ApprovalBoxList.module.scss';
import { API_BASE_URL, APPROVAL_SERVICE } from '../../configs/host-config';
import ReportFilter from '../../components/approval/ReportFilter';
import { useReportFilter } from '../../hooks/useReportFilter';
import PropTypes from 'prop-types';

const ApprovalInProgressBox = ({ onTotalCountChange }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  
  const { filteredReports, handleFilterChange } = useReportFilter(reports);

  useEffect(() => {
    const fetchInProgressReports = async () => {
      setLoading(true);
      setError(null);
      
      const params = {
        role: 'approver',
        sortBy: 'reportCreatedAt',
        sortOrder: 'desc',
        page: 0,
        size: 50,
      };
      
      try {
        const response = await axiosInstance.get(
          `${API_BASE_URL}${APPROVAL_SERVICE}/reports`,
          { params },
        );

        if (response.data?.statusCode === 200) {
          setReports(response.data.result.reports || []);
          setTotalCount(response.data.result.totalElements || 0);
          if (onTotalCountChange) onTotalCountChange(response.data.result.totalElements || 0);
        } else {
          setReports([]);
          setTotalCount(0);
          if (onTotalCountChange) onTotalCountChange(0);
          setError(response.data?.statusMessage || '진행 중인 문서를 불러오는 데 실패했습니다.');
        }
      } catch (err) {
        console.error('결재 중 문서함 문서를 불러오는 중 오류 발생:', err);
        setReports([]);
        setTotalCount(0);
        if (onTotalCountChange) onTotalCountChange(0);
        setError('결재 중 문서함 문서를 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchInProgressReports();
  }, []);

  if (loading) {
    return <div className={styles.loading}>로딩 중...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.reportListContainer}>
      <h3 className={styles.sectionTitle}>결재 중 문서함</h3>
      
      <ReportFilter onFilterChange={handleFilterChange} />
      
      <div className={styles.reportList}>
        {filteredReports.length > 0 ? (
          <>
            <div className={styles.resultInfo}>
              총 {totalCount}건의 문서가 있습니다.
            </div>
            {/* ★★★ 핵심 수정: 렌더링 직전에 sort() 함수를 추가하여 재정렬합니다. ★★★ */}
            {[...filteredReports] // 원본 배열 수정을 방지하기 위해 복사본 생성
              .sort((a, b) => new Date(b.reportCreatedAt) - new Date(a.reportCreatedAt))
              .map((report) => (
                <DraftBoxCard key={report.id} draft={report} />
            ))}
          </>
        ) : (
          <div className={styles.noReports}>
            <div className={styles.noReportsIcon}>📄</div>
            <p>현재 진행 중인 문서가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};

ApprovalInProgressBox.propTypes = {
  onTotalCountChange: PropTypes.func,
};

export default ApprovalInProgressBox;