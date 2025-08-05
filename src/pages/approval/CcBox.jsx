import React, { useState, useEffect, useContext } from 'react';
import axiosInstance from '../../configs/axios-config';
import CcBoxCard from './CcBoxCard';
import styles from './ApprovalBoxList.module.scss';
import { API_BASE_URL, APPROVAL_SERVICE } from '../../configs/host-config';
import { UserContext } from '../../context/UserContext';
import ReportFilter from '../../components/approval/ReportFilter';
import { useReportFilter } from '../../hooks/useReportFilter';
import EmptyState from '../../components/approval/EmptyState';
import Pagination from '../../components/Pagination';

const CcBox = () => {
  const [ccDocs, setCcDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useContext(UserContext);

  // 페이지네이션 및 총 개수 상태 추가
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const { filteredReports, handleFilterChange } = useReportFilter(ccDocs);

  const fetchCcDocs = async (page = 0) => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get(
        `${API_BASE_URL}${APPROVAL_SERVICE}/reports`,
        {
          params: {
            role: 'reference',
            sortBy: 'reportCreatedAt',
            sortOrder: 'desc',
            page: page,
            size: 10, // 페이지네이션을 위해 size 조정
          },
        },
      );
      
      if (res.data?.result) {
        const { reports, totalPages, number, totalElements } = res.data.result;
        setCcDocs(reports || []);
        setTotalPages(totalPages || 0);
        setCurrentPage(number || 0);
        setTotalCount(totalElements || 0); // 백엔드가 알려주는 진짜 총 개수 저장
      } else {
        throw new Error('참조 문서를 불러오지 못했습니다.');
      }
    } catch (err) {
      console.error('수신 참조 문서를 불러오는 중 오류 발생:', err);
      setError('네트워크 오류 또는 서버 오류');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCcDocs();
  }, [user?.id]);

  const handlePageChange = (newPage) => {
    fetchCcDocs(newPage);
  };

  return (
    <div className={styles.reportListContainer}>
      <h3 className="sectionTitle">수신 참조 문서함</h3>
      
      <ReportFilter onFilterChange={handleFilterChange} />
      
      <div className={styles.reportList}>
        {loading && <p>로딩 중...</p>}
        {error && <p className={styles.error}>{error}</p>}
        {!loading && !error && (filteredReports.length > 0 || totalCount > 0) ? (
          <>
            <div className={styles.resultInfo}>
              총 {totalCount}건의 문서가 있습니다.
            </div>
            {filteredReports.map((doc) => <CcBoxCard key={doc.id} doc={doc} />)}

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
            <EmptyState icon="📧" message="수신 참조된 문서가 없습니다." />
          )
        )}
      </div>
    </div>
  );
};

export default CcBox;