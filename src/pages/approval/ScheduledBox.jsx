import React, { useEffect, useState, useContext } from 'react'; // useContext 추가
import axiosInstance from '../../configs/axios-config';
import DraftBoxCard from './DraftBoxCard';
import styles from './ApprovalBoxList.module.scss';
import { API_BASE_URL, APPROVAL_SERVICE } from '../../configs/host-config';
import ReportFilter from '../../components/approval/ReportFilter';
import { useReportFilter } from '../../hooks/useReportFilter';
import EmptyState from '../../components/approval/EmptyState';
import Swal from 'sweetalert2';
import Pagination from '../../components/Pagination';
import { UserContext } from '../../context/UserContext'; // UserContext import 추가

// onTotalCountChange prop 제거
const ScheduledBox = () => {
  const [scheduledDocs, setScheduledDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const { user } = useContext(UserContext); // user 가져오기
  
  const { filteredReports, handleFilterChange } = useReportFilter(scheduledDocs);

  const fetchScheduledDocs = async (page = 0) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}${APPROVAL_SERVICE}/reports/list/scheduled`,
        { params: { page, size: 10 } }
      );
      if (response.data?.statusCode === 200) {
        const { reports, totalElements, totalPages, number } = response.data.result;
        setScheduledDocs(reports || []);
        setTotalCount(totalElements || 0);
        setTotalPages(totalPages || 0);
        setCurrentPage(number || 0);
      } else {
        throw new Error('예약 문서를 불러오는 데 실패했습니다.');
      }
    } catch (err) {
      setError('네트워크 오류 또는 서버 오류');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (user?.id) fetchScheduledDocs();
  }, [user?.id]); // 의존성 배열 수정

  const handlePageChange = (newPage) => {
    fetchScheduledDocs(newPage);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.sectionTitle}>내 예약함</h2>
      <ReportFilter onFilterChange={handleFilterChange} />
      
      {loading && <div className={styles.loading}>로딩 중...</div>}
      {error && <div className={styles.error}>{error}</div>}

      {!loading && !error && (
        <>
          {totalCount > 0 && (
            <div className={styles.resultInfo}>총 {totalCount}건의 문서가 있습니다.</div>
          )}
          {filteredReports.length > 0 ? (
            <div className={styles.list}>
              {filteredReports.map((doc) => (
                <DraftBoxCard
                  key={doc.id}
                  draft={doc}
                  showScheduleInfo={true}

                />
              ))}
            </div>
          ) : (
            <EmptyState 
              message="예약된 문서가 없습니다."
              subMessage="문서 작성 시 '예약 상신'을 선택하여 미래 시간에 자동 상신되도록 설정할 수 있습니다."
            />
          )}
          {totalPages > 1 && (
            <div className={styles.paginationContainer}>
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ScheduledBox;