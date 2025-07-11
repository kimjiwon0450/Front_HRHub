import React, { useState, useEffect } from 'react';
import styles from './ApprovalLineModal.module.scss';
import VisualApprovalLine from './VisualApprovalLine';
import axiosInstance from '../../configs/axios-config';
import { API_BASE_URL, HR_SERVICE } from '../../configs/host-config';
import defaultProfileImage from '../../assets/pin.jpg';


const ApprovalLineModal = ({ approvalLine, reportStatus, onClose }) => {
  const [approverDetails, setApproverDetails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApproverDetails = async () => {
      if (!approvalLine || approvalLine.length === 0) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        // 1. 모든 결재자의 ID를 수집합니다.
        const employeeIds = approvalLine.map((a) => a.employeeId);

        // 2. [수정] 단 한 번의 API 호출로 모든 직원 정보를 가져옵니다.
        // 백엔드에 `/hr-service/employees/details?ids=1,2,3` 형태의 API가 필요합니다.
        const response = await axiosInstance.get(
          `${API_BASE_URL}${HR_SERVICE}/employees/details`, 
          {
            params: {
              ids: employeeIds.join(','), // [101, 102] -> "101,102"
            },
          }
        );

        // 3. [수정] 받아온 데이터를 Map으로 변환하여 빠르게 찾을 수 있도록 합니다.
        // 백엔드 응답이 { result: [...] } 형태라고 가정합니다.
        const detailsMap = new Map(
          response.data.result.map((detail) => [detail.employeeId, detail])
        );

        // 4. 받아온 직원 정보와 기존 결재선 정보를 병합합니다.
        const mergedDetails = approvalLine.map((approver) => {
          const detail = detailsMap.get(approver.employeeId) || {};
          return { ...approver, ...detail };
        });

        setApproverDetails(mergedDetails);
      } catch (error) {
        console.error('결재자 정보를 불러오는 데 실패했습니다:', error);
        setApproverDetails(approvalLine); // 에러 시 이름 등은 없지만 기본 정보는 표시
      } finally {
        setLoading(false);
      }
    };

    fetchApproverDetails();
  }, [approvalLine]);


  if (!approvalLine) return null;

  const getStatusText = (status) => {
    switch (status) {
      case 'APPROVED':
        return '승인';
      case 'REJECTED':
        return '반려';
      case 'PENDING':
        return '대기';
      default:
        return status;
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>결재선 정보</h3>
          <button onClick={onClose} className={styles.closeButton}>&times;</button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.visualLineWrapper}>
            <VisualApprovalLine
              approvalLine={approvalLine}
              reportStatus={reportStatus}
              mode='full'
            />
          </div>
          {loading ? (
            <div className={styles.loading}>로딩 중...</div>
          ) : (
            <div className={styles.approverList}>
              {approverDetails.map((approver) => (
                <div key={approver.employeeId} className={styles.approverItem}>
                  <div className={styles.approverMain}>
                    <img
                      src={approver.profileImageUri || defaultProfileImage}
                      alt='profile'
                      className={styles.profileImage}
                    />
                    <div className={styles.approverInfo}>
                      <div className={styles.nameAndDept}>
                        <span className={styles.name}>{approver.name}</span>
                        <span className={styles.dept}>
                          {approver.department}
                        </span>
                      </div>
                      <div className={styles.statusAndTime}>
                         <span
                          className={`${styles.status} ${
                            styles[approver.approvalStatus?.toLowerCase()]
                          }`}
                        >
                          {getStatusText(approver.approvalStatus)}
                        </span>
                        {approver.approvalDateTime && (
                          <span className={styles.dateTime}>
                            {new Date(
                              approver.approvalDateTime,
                            ).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {approver.approvalComment && (
                    <div className={styles.comment}>
                      {approver.approvalComment}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApprovalLineModal; 