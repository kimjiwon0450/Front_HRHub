import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../configs/axios-config';
import { API_BASE_URL, APPROVAL_SERVICE } from '../../configs/host-config';
import styles from './TemplateList.module.scss';
import { UserContext } from '../../context/UserContext';

const TemplateList = () => {
  const navigate = useNavigate();
  const { userRole } = useContext(UserContext);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTemplates = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get(
        `${API_BASE_URL}${APPROVAL_SERVICE}/templates/list`,
      );
      // API 명세에 따라 'data' 키에서 배열을 가져오도록 수정
      console.log(res.data.result);
      if (res.data && Array.isArray(res.data.result)) {
        setTemplates(res.data.result);
      } else {
        setTemplates([]);
      }
    } catch (err) {
      setError('템플릿 목록을 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleDelete = async (templateId) => {
    if (window.confirm('정말로 이 템플릿을 삭제하시겠습니까?')) {
      try {
        await axiosInstance.delete(
          `${API_BASE_URL}${APPROVAL_SERVICE}/templates/${templateId}`,
        );
        alert('삭제되었습니다.');
        // 삭제 후 목록을 다시 불러옵니다.
        fetchTemplates();
      } catch (err) {
        alert('삭제 중 오류가 발생했습니다.');
      }
    }
  };

  if (loading) return <p>로딩 중...</p>;
  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>보고서 템플릿 관리</h2>
        {userRole === 'ADMIN' && (
          <button
            onClick={() => navigate('/approval/templates/form')}
            className={styles.addButton}
          >
            + 새 템플릿 추가
          </button>
        )}
      </div>
      <ul className={styles.templateList}>
        {templates.length > 0 ? (
          templates.map((template) => (
            <li key={template.templateId} className={styles.templateItem}>
              <div className={styles.templateInfo}>
                <h3>{template.template.title}</h3>
                <p>{template.template.description}</p>
              </div>
              <div className={styles.buttonGroup}>
                <button
                  onClick={() =>
                    navigate(`/approval/form?templateId=${template.templateId}`)
                  }
                  className={styles.useButton}
                >
                  사용하기
                </button>
                {userRole === 'ADMIN' && (
                  <>
                    <button
                      onClick={() =>
                        navigate(
                          `/approval/templates/edit/${template.templateId}`,
                        )
                      }
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(template.templateId)}
                      className={styles.deleteButton}
                    >
                      삭제
                    </button>
                  </>
                )}
              </div>
            </li>
          ))
        ) : (
          <p>생성된 템플릿이 없습니다.</p>
        )}
      </ul>
    </div>
  );
};

export default TemplateList;
