import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../configs/axios-config';
import { API_BASE_URL, APPROVAL_SERVICE } from '../../configs/host-config';
import styles from './ApprovalDetail.module.scss';
import { UserContext } from '../../context/UserContext';
import VisualApprovalLine from '../../components/approval/VisualApprovalLine';
import ApprovalLineModal from '../../components/approval/ApprovalLineModal';

const ApprovalDetail = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [report, setReport] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 백엔드 Enum과 프론트엔드 표시 텍스트 매핑
  const reportStatusMap = {
    DRAFT: '임시 저장',
    IN_PROGRESS: '진행중',
    APPROVED: '최종 승인',
    REJECTED: '반려',
    RECALLED: '회수',
  };

  const approvalStatusMap = {
    PENDING: '대기',
    APPROVED: '승인',
    REJECTED: '반려',
  };
  
  const fetchReportDetail = async () => {
    if (!reportId || isNaN(reportId)) {
      setLoading(false);
      setError('유효하지 않은 보고서 ID입니다.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const [reportResponse, historyResponse] = await Promise.all([
        axiosInstance.get(
          `${API_BASE_URL}${APPROVAL_SERVICE}/reports/${reportId}`,
        ),
        axiosInstance.get(
          `${API_BASE_URL}${APPROVAL_SERVICE}/reports/${reportId}/history`,
        ),
      ]);

      const reportData = reportResponse.data?.result;
      const historyData = historyResponse.data?.result;

      if (reportData) {
        // --- 접근 제어 로직 추가 ---
        const { reportStatus, writer } = reportData;
        const currentUserIsWriter = writer?.id === user?.id;

        if (
          (reportStatus === 'DRAFT' || reportStatus === 'RECALLED') &&
          !currentUserIsWriter
        ) {
          alert('해당 문서에 대한 접근 권한이 없습니다.');
          navigate(-1); // 이전 페이지로 돌아가기
          return;
        }
        // --- 로직 끝 ---

        setReport(reportData);
      } else {
        throw new Error('보고서 정보를 찾을 수 없습니다.');
      }
      if (historyData) {
        setHistory(historyData);
      }
    } catch (err) {
      console.error("상세 정보 로딩 실패:", err);
      setError(err.response?.data?.statusMessage || err.message || "데이터를 불러오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportDetail();
  }, [reportId]);

  const handleApprovalAction = async (isApproved) => {
    const comment = prompt(
      isApproved ? '승인 의견을 입력하세요.' : '반려 사유를 입력하세요.',
    );
    if (!isApproved && !comment) {
      alert('반려 시에는 사유를 반드시 입력해야 합니다.');
      return;
    }
    try {
      await axiosInstance.post(
        `${API_BASE_URL}${APPROVAL_SERVICE}/reports/${reportId}/approvals`,
        {
          approvalStatus: isApproved ? 'APPROVED' : 'REJECTED',
          comment: comment || (isApproved ? '승인합니다.' : ''),
        },
      );
      alert('성공적으로 처리되었습니다.');
      fetchReportDetail(); // 처리 후 데이터 새로고침
    } catch (err) {
      alert(err.response?.data?.message || '처리 중 오류가 발생했습니다.');
    }
  };

  const handleRecall = async () => {
    if (window.confirm('정말로 회수하시겠습니까?')) {
      try {
        await axiosInstance.post(`${API_BASE_URL}${APPROVAL_SERVICE}/reports/${reportId}/recall`);
        alert('회수 처리되었습니다.');
        navigate('/approval/drafts');
      } catch (err) {
        alert(err.response?.data?.message || '회수 중 오류가 발생했습니다.');
      }
    }
  };

  if (loading) return <div className={styles.loading}>로딩 중...</div>;
  if (error) return <div className={styles.error}>에러: {error}</div>;
  if (!report) return <div className={styles.noData}>데이터가 없습니다.</div>;

  const isWriter = report.writer?.id === user?.id;
  const currentApproverLine = report.approvalLine?.find(
    (line) => line.approvalStatus === 'PENDING',
  );
  const isCurrentApprover = currentApproverLine?.employeeId === user?.id;

  return (
    <>
      <div className={styles.detailContainer}>
        <div className={styles.mainContent}>
          <header className={styles.header}>
            <div className={styles.titleGroup}>
              <h1 className={styles.title}>{report.title}</h1>
              <span className={`${styles.statusBadge} ${styles[report.reportStatus?.toLowerCase()]}`}>
                {reportStatusMap[report.reportStatus] || report.reportStatus}
              </span>
            </div>
            <div className={styles.buttonGroup}>
              {isWriter && report.reportStatus === 'IN_PROGRESS' && (
                <button className={styles.recallBtn} onClick={handleRecall}>회수</button>
              )}
              {isWriter && report.reportStatus === 'REJECTED' && (
                <button className={styles.defaultBtn} onClick={() => navigate(`/approval/edit/${reportId}`)}>재작성</button>
              )}
              {isCurrentApprover && (
                <>
                  <button className={styles.approveBtn} onClick={() => handleApprovalAction(true)}>승인</button>
                  <button className={styles.rejectBtn} onClick={() => handleApprovalAction(false)}>반려</button>
                </>
              )}
            </div>
          </header>

          <section className={styles.reportInfo}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>기안자</span>
              <span className={styles.infoValue}>{report.writer?.name || '정보 없음'}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>기안일</span>
              <span className={styles.infoValue}>
                {new Date(report.createdAt || report.reportCreatedAt).toLocaleString()}
              </span>
            </div>
          </section>

          <section className={styles.content}>
            <div dangerouslySetInnerHTML={{ __html: report.content }} />
          </section>

          <section className={styles.historySection}>
            <h4 className={styles.sectionTitle}>결재 이력</h4>
            <ul className={styles.historyList}>
              {history.length > 0 ? (
                history.map((h, index) => (
                  <li key={h.employeeId + '-' + index} className={styles.historyItem}>
                    <div className={styles.historyInfo}>
                      <span className={styles.historyApprover}>{h.employeeName}</span>
                      <span className={`${styles.historyStatus} ${styles[h.approvalStatus?.toLowerCase()]}`}>
                        {approvalStatusMap[h.approvalStatus]}
                      </span>
                    </div>
                    <div className={styles.historyComment}>{h.comment}</div>
                    <div className={styles.historyTimestamp}>{h.approvalDateTime ? new Date(h.approvalDateTime).toLocaleString() : ''}</div>
                  </li>
                ))
              ) : (
                <li className={styles.noHistory}>결재 이력이 없습니다.</li>
              )}
            </ul>
          </section>
        </div>

        <aside className={styles.sidebar}>
          <div className={styles.sidebarSection}>
            <div className={styles.sidebarHeader}>
              <h4>결재선</h4>
              <button className={styles.viewMoreBtn} onClick={() => setIsModalOpen(true)}>전체보기</button>
            </div>
            <VisualApprovalLine
              approvalLine={report.approvalLine}
              reportStatus={report.reportStatus}
              mode='full'
            />
          </div>
        </aside>
      </div>
      {isModalOpen && (
        <ApprovalLineModal
          approvalLine={report.approvalLine}
          reportStatus={report.reportStatus}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};

export default ApprovalDetail;