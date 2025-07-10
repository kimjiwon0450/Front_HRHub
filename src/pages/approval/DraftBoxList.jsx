import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axiosInstance from '../../configs/axios-config';
import DraftBoxCard from './DraftBoxCard';
import styles from './DraftBoxList.module.scss';
import { API_BASE_URL, APPROVAL_SERVICE } from '../../configs/host-config';

const DraftBoxList = () => {
  const [drafts, setDrafts] = useState([]);
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDrafts = async () => {
      setLoading(true);
      setError(null);

      const params = {
        role: 'writer',
        page: 0,
        size: 10,
      };

      if (status) {
        params.status = status;
      }

      try {
        const res = await axiosInstance.get(
          `${API_BASE_URL}${APPROVAL_SERVICE}/reports`,
          { params }
        );

        if (res.data?.statusCode === 200) {
          setDrafts(res.data.result.reports || []);
        } else {
          setError(res.data?.statusMessage || '기안함 목록을 불러오지 못했습니다.');
        }
      } catch (err) {
        console.log(err);
        setError('네트워크 오류 또는 서버 오류');
      } finally {
        setLoading(false);
      }
    };

    fetchDrafts();
  }, [status]);

  let title = '전체 기안';
  if (status === 'APPROVED') {
    title = '종결된 기안';
  } else if (status === 'RECALLED') {
    title = '회수한 기안';
  }

  return (
    <div className={styles.container}>
      <h2>{title}</h2>
      <div className={styles.list}>
        {loading && <p>로딩 중...</p>}
        {error && <p className={styles.error}>{error}</p>}
        {!loading && !error && drafts.length > 0 ? (
          drafts.map((draft) => (
            <DraftBoxCard key={draft.id} draft={draft} />
          ))
        ) : (
          !loading && !error && <p>해당하는 기안서가 없습니다.</p>
        )}
      </div>
    </div>
  );
};

export default DraftBoxList;