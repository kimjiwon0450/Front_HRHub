import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../configs/axios-config';
import { API_BASE_URL, APPROVAL_SERVICE } from '../configs/host-config';

export const useApprovalForm = (templateId, reportId) => {
  const navigate = useNavigate();

  // API 응답 데이터를 한 번에 관리
  const [template, setTemplate] = useState(null);
  const [formData, setFormData] = useState({});
  const [approvalLine, setApprovalLine] = useState([]);
  const [references, setReferences] = useState([]); // 참조자 상태 추가
  const [attachments, setAttachments] = useState([]);

  // UI 상태
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFormData = async () => {
      // ID가 확정되기 전에 불필요한 호출을 방지
      if (!templateId && !reportId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const params = {};
        if (reportId) {
          params.reportId = reportId;
        } else if (templateId) {
          params.templateId = templateId;
        }
        
        const res = await axiosInstance.get(
          `${API_BASE_URL}${APPROVAL_SERVICE}/form`,
          { params },
        );
        console.log("서버로부터 받은 /form API 응답 전체:", res.data);
        if (res.data && res.data.statusCode === 200) {
          const { template, formData, approvalLine, attachments, references } = res.data.result; // 'data' -> 'result'
          
          setTemplate(template);
          setFormData(formData || {}); 
          setApprovalLine(approvalLine || []);
          setReferences(references || []); // 참조자 상태 설정
          setAttachments(attachments || []);
        } else {
          throw new Error(
            res.data.statusMessage || '결재 양식 데이터를 불러오는 데 실패했습니다.', // 'message' -> 'statusMessage'
          );
        }
      } catch (err) {
        console.error('Failed to fetch form data:', err);
        setError(err.message);
        // 필요시 에러 페이지로 이동
        // navigate('/error'); 
      } finally {
        setLoading(false);
      }
    };

    fetchFormData();
  }, [templateId, reportId, navigate]);

  return {
    template,
    formData,
    setFormData, // formData는 사용자가 수정해야 하므로 setter도 반환
    approvalLine,
    setApprovalLine,
    references, // 반환값에 추가
    setReferences, // 반환값에 추가
    attachments,
    setAttachments,
    loading,
    error,
  };
}; 