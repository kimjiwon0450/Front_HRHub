import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../configs/axios-config';
import { UserContext } from '../../context/UserContext';
import styles from './ApprovalHome.module.scss';
import SummaryCard from './SummaryCard';
import MyReportsList from './MyReportsList'; // ApprovalBoxList 대신 MyReportsList를 임포트
import FrequentTemplatesModal from './FrequentTemplatesModal';
import { API_BASE_URL, APPROVAL_SERVICE } from '../../configs/host-config';

// 아이콘 임포트
import delayedIcon from '/icons/advanced.png';
import uncheckedIcon from '/icons/intermediate.png';
import ccIcon from '/icons/beginner.png';
import historyIcon from '/icons/master.png';
import templateIcon from '/icons/admin.png'; // 예시 아이콘

const ApprovalHome = () => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [summaryData, setSummaryData] = useState({ delayed: 0, unchecked: 0, cc: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [frequentTemplates, setFrequentTemplates] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allTemplates, setAllTemplates] = useState([]);


  useEffect(() => {
    if (!user) return;

    const fetchAllTemplates = async () => {
      try {
        const response = await axiosInstance.get(
          `${API_BASE_URL}${APPROVAL_SERVICE}/templates`
        );
        if (response.data && Array.isArray(response.data.data)) {
          setAllTemplates(response.data.data);
        } else {
          setAllTemplates([]);
        }
      } catch (error) {
        setAllTemplates([]);
      }
    };

    const loadFrequentTemplatesFromStorage = () => {
      const stored = localStorage.getItem('frequentTemplates');
      setFrequentTemplates(stored ? JSON.parse(stored) : []);
    };

    fetchAllTemplates();
    loadFrequentTemplatesFromStorage(); // localStorage에서 데이터 로드
    setSummaryData({ delayed: 5, unchecked: 2, cc: 0, total: 27 }); // 임시 데이터
    setLoading(false);
  }, [user]);

  const handleSaveTemplates = (selectedTemplateIds) => {
    localStorage.setItem('frequentTemplates', JSON.stringify(selectedTemplateIds));
    setFrequentTemplates(selectedTemplateIds);
    console.log('localStorage에 저장된 템플릿 ID:', selectedTemplateIds);
  };
  
  const getTemplateTitle = (templateId) => {
    const template = allTemplates.find(t => t.id === templateId);
    return template ? template.title : '알 수 없는 양식';
  };

  return (
    <div className={styles.approvalHomeContainer}>
      {isModalOpen && (
        <FrequentTemplatesModal 
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveTemplates}
        />
      )}

      {/* 자주 쓰는 결재 양식 */}
      <div className={styles.frequentTemplatesSection}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>자주 쓰는 결재 양식</h3>
          <button onClick={() => setIsModalOpen(true)} className={styles.manageButton}>관리하기</button>
        </div>
        {frequentTemplates.length > 0 ? (
          <div className={styles.templatesGrid}>
            {frequentTemplates.map(templateId => (
              <div key={templateId} className={styles.templateCard} onClick={() => navigate(`/approval/new?templateId=${templateId}`)}>
                <img src={templateIcon} alt="양식" />
                <span>{getTemplateTitle(templateId)}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.noTemplates}>
            <span>결재 양식 사용정보가 존재하지 않습니다.</span>
            <button onClick={() => setIsModalOpen(true)} className={styles.addButton}>+ 추가하기</button>
          </div>
        )}
      </div>
      
      {/* 요약 카드 */}
      <div className={styles.summarySection}>
        <SummaryCard title="일주일 이상 지연된 수신결재" count={`${summaryData.delayed}건`} icon={delayedIcon} />
        <SummaryCard title="처리하지 않은 수신결재" count={`${summaryData.unchecked}건`} icon={uncheckedIcon} />
        <SummaryCard title="확인하지 않은 수신참조" count={`${summaryData.cc}건`} icon={ccIcon} />
        <SummaryCard title="결재내역보기" count={`${summaryData.total}건`} icon={historyIcon} />
      </div>

      {/* 결재 목록 */}
      <div className={styles.reportListContainer}>
        {loading ? (
          <div className={styles.loading}>로딩 중...</div>
        ) : (
          <MyReportsList /> // ApprovalBoxList 대신 MyReportsList를 렌더링
        )}
      </div>
    </div>
  );
};

export default ApprovalHome; 