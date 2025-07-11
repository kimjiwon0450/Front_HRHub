import React, { useState, useEffect } from 'react';
import axiosInstance from '../../configs/axios-config';
import DraftBoxCard from './DraftBoxCard';
import styles from './DraftBoxList.module.scss';
import { API_BASE_URL, APPROVAL_SERVICE } from '../../configs/host-config';

const DraftBoxList = () => {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDrafts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axiosInstance.get(
          `${API_BASE_URL}${APPROVAL_SERVICE}/reports`,
          {
            params: {
              role: 'writer',
              status: 'DRAFT', // 'DRAFT' 상태의 문서만 요청
              page: 0,
              size: 10,
            },
          },
        );

        if (res.data?.statusCode === 200) {
          setDrafts(res.data.result.reports || []);
        } else {
          setError(
            res.data?.statusMessage || '임시 저장 문서를 불러오지 못했습니다.',
          );
        }
      } catch (err) {
        console.error(err);
        setError('네트워크 오류 또는 서버 오류');
      } finally {
        setLoading(false);
      }
    };

    fetchDrafts();
  }, []);

  return (
    <div className={styles.container}>
      <h2>임시 저장함</h2>
      <div className={styles.list}>
        {loading && <p>로딩 중...</p>}
        {error && <p className={styles.error}>{error}</p>}
        {!loading && !error && drafts.length > 0 ? (
          drafts.map((draft) => <DraftBoxCard key={draft.id} draft={draft} />)
        ) : (
          !loading && !error && <p>임시 저장된 문서가 없습니다.</p>
        )}
      </div>
    </div>
  );
};

export default DraftBoxList;