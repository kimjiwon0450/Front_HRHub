import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../configs/axios-config';
import { API_BASE_URL, APPROVAL_SERVICE } from '../../configs/host-config';
import styles from './ApprovalDetail.module.scss';

const ApprovalDetail = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 임시 데이터 (나중에 삭제)
  const loggedInUserId = 'user1'; // 실제 로그인 유저 정보로 교체 필요

  const fetchReportDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const reportRes = await axiosInstance.get(
        `${API_BASE_URL}${APPROVAL_SERVICE}/reports/${reportId}`
      );
      if (reportRes.data.statusCode === 200) {
        setReport(reportRes.data.result);
      } else {
        throw new Error(reportRes.data.statusMessage || '보고서 정보를 불러오는 데 실패했습니다.');
      }

      const historyRes = await axiosInstance.get(
        `${API_BASE_URL}${APPROVAL_SERVICE}/reports/${reportId}/history`
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
    fetchReportDetail();
  }, [reportId]);

  const handleApprovalAction = async (isApproved) => {
    const comment = prompt(isApproved ? "승인 의견을 입력하세요." : "반려 사유를 입력하세요.");
    if (!isApproved && !comment) {
      alert("반려 시에는 사유를 반드시 입력해야 합니다.");
      return;
    }

    try {
      await axiosInstance.post(
        `${API_BASE_URL}${APPROVAL_SERVICE}/reports/${reportId}/approvals`,
        {
          isApproved,
          comment: comment || '승인되었습니다.',
        }
      );
      alert('성공적으로 처리되었습니다.');
      fetchReportDetail(); // 데이터 새로고침
    } catch (err) {
      alert(err.response?.data?.message || '처리 중 오류가 발생했습니다.');
    }
  };

  const handleRecall = async () => {
    if (window.confirm("정말로 회수하시겠습니까?")) {
      try {
        await axiosInstance.post(
          `${API_BASE_URL}${APPROVAL_SERVICE}/reports/${reportId}/recall`
        );
        alert('회수 처리되었습니다.');
        navigate('/approval/drafts'); // 기안함으로 이동
      } catch (err) {
        alert(err.response?.data?.message || '회수 중 오류가 발생했습니다.');
      }
    }
  };

  if (loading) return <div className={styles.loading}>로딩 중...</div>;
  if (error) return <div className={styles.error}>에러: {error}</div>;
  if (!report) return <div className={styles.noData}>보고서 데이터가 없습니다.</div>;

  const isWriter = report.writer?.id === loggedInUserId;
  const isCurrentApprover = report.currentApprover?.id === loggedInUserId;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>{report.title}</h1>
        <div className={styles.buttonGroup}>
          {isWriter && report.reportStatus === 'IN_PROGRESS' && <button onClick={handleRecall}>회수</button>}
          {isWriter && report.reportStatus === 'REJECTED' && <button onClick={() => navigate(`/approval/resubmit/${reportId}`)}>재상신</button>}
          {isCurrentApprover && <button className={styles.approve} onClick={() => handleApprovalAction(true)}>승인</button>}
          {isCurrentApprover && <button className={styles.reject} onClick={() => handleApprovalAction(false)}>반려</button>}
        </div>
      </header>

      <section className={styles.metadata}>
        <div className={styles.metaItem}>
          <strong>기안자</strong>
          <span>{report.writer?.name} ({report.writer?.department})</span>
        </div>
        <div className={styles.metaItem}>
          <strong>기안일</strong>
          <span>{new Date(report.createdAt).toLocaleString()}</span>
        </div>
        <div className={styles.metaItem}>
          <strong>문서 상태</strong>
          <span>{report.reportStatus}</span>
        </div>
      </section>

      <section className={styles.content}>
        <h3>보고 내용</h3>
        <div dangerouslySetInnerHTML={{ __html: report.content }} />
      </section>

      <section className={styles.approvalLine}>
        <h3>결재선</h3>
        {/* 결재선 정보 렌더링 */}
      </section>

      <section className={styles.history}>
        <h3>결재 이력</h3>
        <ul>
          {history.map(h => (
            <li key={h.id}>
              {h.timestamp} - {h.approverName} ({h.status}) - {h.comment}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default ApprovalDetail; 