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

  const reportStatusMap = {
    DRAFT: '임시 저장',
    PROCESSING: '진행중',
    APPROVED: '최종 승인',
    REJECTED: '반려',
    RECALLED: '회수',
  };

  const fetchReportDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const reportRes = await axiosInstance.get(
        `${API_BASE_URL}${APPROVAL_SERVICE}/reports/${reportId}`,
      );
      if (reportRes.data.statusCode === 200) {
        setReport(reportRes.data.result);
      } else {
        throw new Error(
          reportRes.data.statusMessage ||
            '보고서 정보를 불러오는 데 실패했습니다.',
        );
      }

      const historyRes = await axiosInstance.get(
        `${API_BASE_URL}${APPROVAL_SERVICE}/reports/${reportId}/history`,
      );
      if (historyRes.data.statusCode === 200) {
        setHistory(historyRes.data.result || []);
      } else {
        setHistory([]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (reportId && !isNaN(reportId)) {
      fetchReportDetail();
    }
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
      fetchReportDetail();
    } catch (err) {
      alert(err.response?.data?.message || '처리 중 오류가 발생했습니다.');
    }
  };

  const handleRecall = async () => {
    if (window.confirm('정말로 회수하시겠습니까?')) {
      try {
        await axiosInstance.post(
          `${API_BASE_URL}${APPROVAL_SERVICE}/reports/${reportId}/recall`,
        );
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

  const isWriter = report.employee?.id === user?.id;
  
  const currentApprover = report.approvalLines?.find(
    (line) => line.status === 'PENDING',
  )?.employee;

  const isCurrentApprover = currentApprover?.id === user?.id;

  return (
    <>
      <div className={styles.detailContainer}>
        <div className={styles.mainContent}>
          <header className={styles.header}>
            <div className={styles.titleGroup}>
              <h1 className={styles.title}>{report.title}</h1>
              <span
                className={`${styles.statusBadge} ${
                  styles[report.status?.toLowerCase()]
                }`}
              >
                {reportStatusMap[report.status] || report.status}
              </span>
            </div>
            <div className={styles.buttonGroup}>
              {isWriter && report.status === 'PROCESSING' && (
                <button className={styles.recallBtn} onClick={handleRecall}>
                  회수
                </button>
              )}
              {isWriter && report.status === 'REJECTED' && (
                <button
                  className={styles.defaultBtn}
                  onClick={() => navigate(`/approval/edit/${reportId}`)}
                >
                  재작성
                </button>
              )}
              {isCurrentApprover && (
                <>
                  <button
                    className={styles.approveBtn}
                    onClick={() => handleApprovalAction(true)}
                  >
                    승인
                  </button>
                  <button
                    className={styles.rejectBtn}
                    onClick={() => handleApprovalAction(false)}
                  >
                    반려
                  </button>
                </>
              )}
            </div>
          </header>

          <section className={styles.reportInfo}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>기안자</span>
              <span className={styles.infoValue}>
                {report.employee?.name} ({report.employee?.department})
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>기안일</span>
              <span className={styles.infoValue}>
                {new Date(report.createdAt).toLocaleString()}
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
                history.map((h) => (
                  <li key={h.id} className={styles.historyItem}>
                    <div className={styles.historyInfo}>
                      <span className={styles.historyApprover}>{h.approverName}</span>
                      <span className={`${styles.historyStatus} ${styles[h.status?.toLowerCase()]}`}>{h.status}</span>
                    </div>
                    <div className={styles.historyComment}>{h.comment}</div>
                    <div className={styles.historyTimestamp}>{new Date(h.timestamp).toLocaleString()}</div>
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
              <button
                className={styles.viewMoreBtn}
                onClick={() => setIsModalOpen(true)}
              >
                전체보기
              </button>
            </div>
            <VisualApprovalLine
              approvalLine={report.approvalLines}
              reportStatus={report.status}
              mode='full'
            />
          </div>
        </aside>
      </div>
      {isModalOpen && (
        <ApprovalLineModal
          approvalLine={report.approvalLines}
          reportStatus={report.status}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};

export default ApprovalDetail; 