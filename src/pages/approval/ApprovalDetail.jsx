import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../configs/axios-config';
import { API_BASE_URL, APPROVAL_SERVICE } from '../../configs/host-config';
import styles from './ApprovalDetail.module.scss';
import { UserContext } from '../../context/UserContext';
import VisualApprovalLine from '../../components/approval/VisualApprovalLine';
import ApprovalLineModal from '../../components/approval/ApprovalLineModal';
import Swal from 'sweetalert2';
import AttachmentList from '../../components/approval/AttachmentList';
import ModalPortal from '../../components/approval/ModalPortal';

const COMMON_COMMENTS = [
  '승인합니다.',
  '수고하셨습니다.',
  '반려합니다.',
  '보완 후 재상신 바랍니다.',
];

const ApprovalDetail = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const [report, setReport] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [approvalComment, setApprovalComment] = useState('');
  const [actionType, setActionType] = useState(''); // 'approve' | 'reject'
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [commentError, setCommentError] = useState('');
  // 커스텀 모달 관련 setSuccessMessage, setIsSuccessModalOpen 등은 제거

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
        const { reportStatus, writer, approvalLine } = reportData;
        const currentUserIsWriter = writer?.id === user?.id;

        // --- 백엔드 상태 보정 로직 ---
        const hasRejection = approvalLine?.some(
          (a) => a.approvalStatus === 'REJECTED',
        );
        if (hasRejection && reportData.reportStatus !== 'REJECTED') {
          console.warn(
            '백엔드 상태 불일치: REJECTED 결재선이 있으나 최종 상태가 REJECTED가 아님. 상태를 강제 조정합니다.',
          );
          reportData.reportStatus = 'REJECTED';
        }

        if (
          (reportStatus === 'DRAFT' || reportStatus === 'RECALLED') &&
          !currentUserIsWriter
        ) {
          Swal.fire({
            icon: 'warning',
            title: '해당 문서에 대한 접근 권한이 없습니다.',
            confirmButtonText: '확인',
          });
          navigate(-1); // 이전 페이지로 돌아가기
          return;
        }
        setReport(reportData);
      } else {
        throw new Error('보고서 정보를 찾을 수 없습니다.');
      }

      if (historyData) {
        setHistory(historyData);
      }
    } catch (err) {
      console.error('상세 정보 로딩 실패:', err);
      setError(
        err.response?.data?.statusMessage ||
          err.message ||
          '데이터를 불러오는 데 실패했습니다.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchReportDetail();
    }
  }, [reportId, user?.id]);

  const handleApprovalAction = async (isApproved) => {
    const { value: comment } = await Swal.fire({
      title: isApproved ? '승인 사유를 입력하세요' : '반려 사유를 입력하세요',
      input: 'textarea',
      inputPlaceholder: '사유를 입력하세요',
      showCancelButton: true,
      confirmButtonText: '확인',
      cancelButtonText: '취소',
    });
    if (comment === undefined) return;
    try {
      await axiosInstance.post(
        `${API_BASE_URL}${APPROVAL_SERVICE}/reports/${reportId}/approvals`,
        {
          approvalStatus: isApproved ? 'APPROVED' : 'REJECTED',
          comment: comment || (isApproved ? '승인합니다.' : ''),
        },
      );
      await Swal.fire({
        icon: 'success',
        title: '성공적으로 처리되었습니다.',
        confirmButtonText: '확인',
      });
      fetchReportDetail();
    } catch (err) {
      await Swal.fire({
        icon: 'error',
        title: err.response?.data?.message || '처리 중 오류가 발생했습니다.',
        confirmButtonText: '확인',
      });
    }
  };

  // 승인/반려 버튼 클릭 시(모달 오픈만)
  const handleActionClick = (type) => {
    setActionType(type);
    setConfirmModalOpen(true);
    setCommentError('');
    setApprovalComment(''); // 모달 열 때 입력란 초기화
  };

  // 2차 모달에서 최종 확인
  const handleConfirm = async () => {
    if (!approvalComment.trim()) {
      setCommentError('사유를 입력해주세요.');
      return;
    }
    try {
      await axiosInstance.post(
        `${API_BASE_URL}${APPROVAL_SERVICE}/reports/${reportId}/approvals`,
        {
          approvalStatus: actionType === 'approve' ? 'APPROVED' : 'REJECTED',
          comment: approvalComment,
        },
      );
      await Swal.fire({
        icon: 'success',
        title: '성공적으로 처리되었습니다.',
        confirmButtonText: '확인',
      });
      setConfirmModalOpen(false);
      setApprovalComment('');
      fetchReportDetail();
    } catch (err) {
      await Swal.fire({
        icon: 'error',
        title: err.response?.data?.message || '처리 중 오류가 발생했습니다.',
        confirmButtonText: '확인',
      });
    }
  };

  const handleRecall = async () => {
    const result = await Swal.fire({
      title: '회수하시겠습니까?',
      text: '문서를 회수하면 결재가 중단됩니다.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '예',
      cancelButtonText: '아니오',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      await axiosInstance.post(
        `${API_BASE_URL}${APPROVAL_SERVICE}/reports/${reportId}/recall`,
      );
      await Swal.fire({
        icon: 'success',
        title: '회수 처리되었습니다.',
        confirmButtonText: '확인',
      });
      navigate('/approval/drafts');
    } catch (err) {
      await Swal.fire({
        icon: 'error',
        title: err.response?.data?.message || '회수 중 오류가 발생했습니다.',
        confirmButtonText: '확인',
      });
    }
  };

  // 모달 확인 버튼 클릭 시 후처리
  // (커스텀 모달 관련 setSuccessMessage, setIsSuccessModalOpen 등은 제거)

  if (loading) return <div className={styles.loading}>로딩 중...</div>;
  if (error) return <div className={styles.error}>에러: {error}</div>;
  if (!report) return <div className={styles.noData}>데이터가 없습니다.</div>;

  const isWriter = report.writer?.id === user?.id;
  const isRejected = report.reportStatus === 'REJECTED';
  const currentApproverLine = report.approvalLine?.find(
    (line) => line.approvalStatus === 'PENDING',
  );
  const isCurrentApprover = currentApproverLine?.employeeId === user?.id;

  // 디버깅용 로그
  console.log('[결재상세] approvalLine:', report.approvalLine);
  console.log('[결재상세] user.id:', user?.id);
  console.log('[결재상세] currentApproverLine:', currentApproverLine);
  console.log('[결재상세] isCurrentApprover:', isCurrentApprover);
  console.log('[결재상세] reportStatus:', report.reportStatus);

  // ★★★ 1. 첨부파일을 이미지와 그 외 파일로 분리하는 로직 ★★★
  const isImageFile = (fileName) => {
    if (!fileName) return false;
    const extension = fileName.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension);
  };

  const imageAttachments =
    report.attachments?.filter((file) => isImageFile(file.fileName)) || [];
  const nonImageAttachments =
    report.attachments?.filter((file) => !isImageFile(file.fileName)) || [];
  // ★★★ ----------------------------------------------- ★★★

  // 재상신 횟수 제한: 반려(REJECTED) 후 재상신(상태 IN_PROGRESS/APPROVED 등)으로 넘어간 횟수 카운트
  let resubmitCount = 0;
  if (history && history.length > 0) {
    // 반려(REJECTED) 상태가 등장한 이후, 다시 결재가 시작된 경우를 카운트
    let rejectedFound = false;
    history.forEach(h => {
      if (h.approvalStatus === 'REJECTED') {
        rejectedFound = true;
      } else if (rejectedFound && (h.approvalStatus === 'APPROVED' || h.approvalStatus === 'PENDING')) {
        resubmitCount++;
        rejectedFound = false;
      }
    });
  }
  // ★★★ isResubmitDisabled 선언 (REJECTED 상태가 아니거나, 3회 이상이면 비활성화) ★★★
  const isResubmitDisabled = report.reportStatus !== 'REJECTED' || resubmitCount >= 3;

  // 회수 버튼: 작성자(본인) + IN_PROGRESS 상태 + 한 번도 승인받지 않은 경우만
  const hasAnyApproved = report.approvalLine && report.approvalLine.some(line => line.approvalStatus === 'APPROVED');

  return (
    <div className={styles.approvalContainer}>
      <div className={styles.detailMainBox}>
        {/* 상단: 제목/상태/기본정보 */}
        <div className={styles.topSection}>
          <div className={styles.titleBox}>
            <h1 className={styles.title}>{report.title}</h1>
            <span className={styles.statusBadge + ' ' + styles[report.reportStatus?.toLowerCase()]}> {reportStatusMap[report.reportStatus]} </span>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.buttonGroup}>
              {/* 재상신 버튼: 작성자(본인) + REJECTED 상태만 */}
              {isWriter && isRejected && (
                <button
                  className={styles.resubmitBtn}
                  onClick={() => navigate(`/approval/new?resubmit=${report.id}`)}
                  disabled={isResubmitDisabled}
                  title={isResubmitDisabled ? '재상신은 최대 3회까지만 가능합니다.' : ''}
                >
                  재상신
                </button>
              )}
              {/* 회수 버튼: 작성자(본인) + IN_PROGRESS 상태만 + 한 번도 승인받지 않은 경우만 */}
              {isWriter && report.reportStatus === 'IN_PROGRESS' && !hasAnyApproved && (
                <button
                  className={styles.resubmitBtn}
                  style={{ background: '#aaa' }}
                  onClick={handleRecall}
                >
                  회수
                </button>
              )}
              {/* 승인/반려 버튼: 결재선의 현재 결재자(본인)만 */}
              {isCurrentApprover && (
                <>
                  <button className={styles.resubmitBtn} style={{ background: '#4caf50', color: '#fff' }} onClick={() => handleActionClick('approve')}>승인</button>
                  <button className={styles.resubmitBtn} style={{ background: '#f44336', color: '#fff' }} onClick={() => handleActionClick('reject')}>반려</button>
                </>
              )}
            </div>
            <div className={styles.infoBox}>
              <span><b>기안자</b> {report.writer?.name || '정보 없음'}</span>
              <span><b>기안일</b> {new Date(report.createdAt || report.reportCreatedAt).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* 중앙: 동적 필드/본문/첨부파일 */}
        <div className={styles.contentSection}>
          {/* 동적 필드 */}
          {report.template && report.template.content && Array.isArray(report.template.content) ? (
            <div className={styles.dynamicFields}>
              <table className={styles.reportTable}>
                <tbody>
                  {report.template.content.map((field, idx) => {
                    let fieldValue = '';
                    if (report.formData) {
                      if (report.formData[field.id] !== undefined) {
                        fieldValue = report.formData[field.id];
                      } else if (field.type === 'period') {
                        const startKey = `${field.id}_start`;
                        const endKey = `${field.id}_end`;
                        const startValue = report.formData[startKey];
                        const endValue = report.formData[endKey];
                        if (startValue && endValue) {
                          fieldValue = `${startValue} ~ ${endValue}`;
                        } else if (startValue) {
                          fieldValue = startValue;
                        } else if (endValue) {
                          fieldValue = endValue;
                        }
                      } else {
                        fieldValue = report.formData[field.id] || '';
                      }
                    }
                    return (
                      <tr key={field.id || idx} className={styles.tableRow}>
                        <td className={styles.fieldLabel}>{field.header || field.label || field.name || field.id}</td>
                        <td className={styles.fieldValue}>{fieldValue}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : report.reportTemplateData ? (
            (() => {
              let fields;
              try {
                fields = JSON.parse(report.reportTemplateData);
              } catch (e) {
                fields = null;
              }
              if (fields && Array.isArray(fields)) {
                return (
                  <div className={styles.dynamicFields}>
                    <table className={styles.reportTable}>
                      <tbody>
                        {fields.map((field, idx) => (
                          <tr key={field.id || idx} className={styles.tableRow}>
                            <td className={styles.fieldLabel}>{field.header || field.label || field.name || field.id}</td>
                            <td className={styles.fieldValue}>{field.value ?? ''}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              }
              return null;
            })()
          ) : null}

          {/* 본문 */}
          <div className={styles.contentBody}>
            <div dangerouslySetInnerHTML={{ __html: report.content }} />
          </div>

          {/* 이미지 첨부 */}
          {imageAttachments.length > 0 && (
            <div className={styles.imageGallery}>
              {imageAttachments.map((file, index) => {
                // file.url, file.downloadUrl, file.path 중 첫 번째로 존재하는 값을 사용
                const imageUrl = file.url || file.downloadUrl || file.path || '';
                return (
                  <div key={index} className={styles.imageWrapper}>
                    <img
                      src={imageUrl}
                      alt={file.fileName}
                      className={styles.attachedImage}
                    />
                  </div>
                );
              })}
            </div>
          )}

          {/* 파일 첨부 */}
          {nonImageAttachments.length > 0 && (
            <section className={styles.attachmentSection}>
              <AttachmentList
                attachments={nonImageAttachments}
                readonly={true}
              />
            </section>
          )}
        </div>

        {/* 하단: 결재선/결재이력 */}
        <div className={styles.bottomSection}>
          <div className={styles.approvalLineBox}>
            <div className={styles.approvalLineHeader}>
              <h4>결재선</h4>
              <button
                className={styles.viewMoreBtn}
                onClick={() => setIsModalOpen(true)}
              >
                전체보기
              </button>
            </div>
            <VisualApprovalLine
              approvalLine={report.approvalLine}
              reportStatus={report.reportStatus}
              mode='full'
            />
          </div>
          {/* 참조자(연람자) 표시 */}
          {/* 참조자(연람자) 표시 */}
          <div className={styles.historySection}>
            <h4 className={styles.sectionTitle}>결재 이력</h4>
            <ul className={styles.historyList}>
              {history.length > 0 ? (
                history.map((h, index) => (
                  <li
                    key={h.employeeId + '-' + index}
                    className={styles.historyItem}
                  >
                    <div className={styles.historyInfo}>
                      <span className={styles.historyApprover}>
                        {h.employeeName}
                      </span>
                      <span
                        className={`${styles.historyStatus} ${styles[h.approvalStatus?.toLowerCase()]}`}
                      >
                        {approvalStatusMap[h.approvalStatus]}
                      </span>
                    </div>
                    <div className={styles.historyComment}>{h.comment}</div>
                    <div className={styles.historyTimestamp}>
                      {h.approvalDateTime
                        ? new Date(h.approvalDateTime).toLocaleString()
                        : ''}
                    </div>
                  </li>
                ))
              ) : (
                <li className={styles.noHistory}>결재 이력이 없습니다.</li>
              )}
            </ul>
          </div>
        </div>
      </div>
      {isModalOpen && (
        <ApprovalLineModal
          approvalLine={report.approvalLine}
          reportStatus={report.reportStatus}
          onClose={() => setIsModalOpen(false)}
        />
      )}
      {/* 2차 확인 모달 */}
      {confirmModalOpen && (
        <ModalPortal>
          <div className={styles.confirmModalOverlay}>
            <div className={styles.confirmModal}>
              <h3>
                정말 {actionType === 'approve' ? '승인' : '반려'}하시겠습니까?
              </h3>
              {/* 자주 쓰는 멘트 버튼 */}
              <div className={styles.commonComments}>
                {COMMON_COMMENTS.map((c) => (
                  <button
                    type='button'
                    key={c}
                    onClick={() => setApprovalComment(c)}
                    className={styles.commentBtn}
                  >
                    {c}
                  </button>
                ))}
              </div>
              {/* 멘트 입력란 */}
              <textarea
                className={styles.commentInput}
                value={approvalComment}
                onChange={(e) => setApprovalComment(e.target.value)}
                placeholder='사유를 입력하세요'
                required
              />
              {commentError && (
                <div className={styles.commentError}>{commentError}</div>
              )}
              <div className={styles.confirmModalBtns}>
                <button className={styles.confirmBtn} onClick={handleConfirm}>
                  확인
                </button>
                <button
                  className={styles.cancelBtn}
                  onClick={() => setConfirmModalOpen(false)}
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
      {/* 커스텀 모달 관련 setSuccessMessage, setIsSuccessModalOpen 등은 제거 */}
    </div>
  );
};

export default ApprovalDetail;
