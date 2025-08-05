import React, { useEffect, useState } from 'react';
import axiosInstance from '../../configs/axios-config';
import DraftBoxCard from './DraftBoxCard';
import styles from './ApprovalBoxList.module.scss';
import { API_BASE_URL, APPROVAL_SERVICE } from '../../configs/host-config';
import ReportFilter from '../../components/approval/ReportFilter';
import { useReportFilter } from '../../hooks/useReportFilter';
import PropTypes from 'prop-types';
import EmptyState from '../../components/approval/EmptyState';
import Pagination from '../../components/Pagination'; // 페이지네이션을 위해 추가

// onTotalCountChange prop은 더 이상 사용하지 않으므로 제거합니다.
const CompletedBox = () => {
  const [completedDocs, setCompletedDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  const { filteredReports, handleFilterChange } = useReportFilter(completedDocs);

  const fetchCompletedDocs = async (page = 0) => {
    setLoading(true);
    setError(null);
    try {
      // ★★★ 핵심: API를 단 한 번, 명확한 조건으로 호출합니다. ★★★
      const response = await axiosInstance.get(
        `${API_BASE_URL}${APPROVAL_SERVICE}/reports`,
        {
          params: { 
            role: 'writer',           // 1. 내가 기안한 문서
            status: 'APPROVED',       // 2. 상태가 '승인'인 문서
            sortBy: 'reportCreatedAt',
            sortOrder: 'desc',
            page: page, 
            size: 10 // 한 페이지에 10개씩
          },
        }
      );

      // ★★★ 디버깅을 위한 로그 추가 ★★★
      console.log("📄 [CompletedBox] '내가 기안한 완료 문서' API 응답:", response.data.result);

      if (response.data?.result) {
        const { reports, totalPages, number } = response.data.result;
        setCompletedDocs(reports || []);
        setTotalPages(totalPages || 0);
        setCurrentPage(number || 0);
      } else {
        throw new Error('완료된 문서를 불러오지 못했습니다.');
      }
    } catch (err) {
      console.error('완료 문서를 불러오는 중 오류 발생:', err.response?.data || err);
      setError('완료된 문서를 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompletedDocs();
  }, []); // 컴포넌트가 처음 마운트될 때 한 번만 호출

  const handlePageChange = (newPage) => {
    fetchCompletedDocs(newPage);
  };

  return (
    <div className={styles.reportListContainer}>
      <h2 className="sectionTitle">결재 완료 문서함</h2>
      
      <ReportFilter onFilterChange={handleFilterChange} />
      
      <div className={styles.reportList}>
        {loading && <p>로딩 중...</p>}
        {error && <p className={styles.error}>{error}</p>}
        {!loading && !error && filteredReports.length > 0 ? (
          <>
            <div className={styles.resultInfo}>
              총 {filteredReports.length}건의 문서가 검색되었습니다.
            </div>
            {filteredReports.map((doc) => <DraftBoxCard key={doc.id} draft={doc} />)}
            
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        ) : (
          !loading && !error && (
            <EmptyState icon="📁" message="완료된 문서가 없습니다." />
          )
        )}
      </div>
    </div>
  );
};
export default CompletedBox;