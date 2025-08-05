import React, { useEffect, useState } from 'react';
import axiosInstance from '../../configs/axios-config';
import DraftBoxCard from './DraftBoxCard';
import styles from './ApprovalBoxList.module.scss';
import { API_BASE_URL, APPROVAL_SERVICE } from '../../configs/host-config';
import ReportFilter from '../../components/approval/ReportFilter';
import { useReportFilter } from '../../hooks/useReportFilter';
import EmptyState from '../../components/approval/EmptyState';
import Pagination from '../../components/Pagination';

const ApprovalInProgressBox = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const { filteredReports, handleFilterChange } = useReportFilter(reports);

  const fetchInProgressReports = async (page = 0) => {
    setLoading(true);
    setError(null);
    try {
      // "내가 기안한 진행중 문서"만 조회
      const response = await axiosInstance.get(
        `${API_BASE_URL}${APPROVAL_SERVICE}/reports`,
        { 
            params: { 
                role: 'writer', 
                status: 'IN_PROGRESS', 
                sortBy: 'reportCreatedAt', 
                sortOrder: 'desc', 
                page, 
                size: 10 
            } 
        }
      );
      
      if(response.data?.result) {
        const { reports, totalPages, number, totalElements } = response.data.result;
        setReports(reports || []);
        setTotalPages(totalPages || 0);
        setCurrentPage(number || 0);
        setTotalCount(totalElements || 0);
      } else {
        throw new Error('결재 중 문서를 불러오지 못했습니다.');
      }
    } catch (err) {
      setError('결재 중 문서를 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInProgressReports();
  }, []);

  const handlePageChange = (newPage) => {
    fetchInProgressReports(newPage);
  };

  return (
    <div className={styles.reportListContainer}>
      <h2 className="sectionTitle">내 결재함</h2>
      <ReportFilter onFilterChange={handleFilterChange} />
      <div className={styles.reportList}>
        {loading && <p>로딩 중...</p>}
        {error && <p className={styles.error}>{error}</p>}
        {(filteredReports.length > 0 || totalCount > 0) ? (
          <>
            <div className={styles.resultInfo}>
              총 {totalCount}건의 문서가 있습니다.
            </div>
            {filteredReports.map((report) => (
              <DraftBoxCard key={report.id} draft={report} />
            ))}
            {totalPages > 1 && (
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
            )}
          </>
        ) : (
          !loading && !error && (
            <EmptyState icon="📄" message="현재 진행 중인 문서가 없습니다." />
          )
        )}
      </div>
    </div>
  );
};

export default ApprovalInProgressBox;