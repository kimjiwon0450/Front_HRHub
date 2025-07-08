import React, { useEffect, useState, useContext } from 'react';
import { API_BASE_URL, NOTICE_SERVICE } from '../../configs/host-config';
import { UserContext } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';

const NoticeAlertPage = () => {
    const { userId, accessToken, isInit } = useContext(UserContext);
    const [alerts, setAlerts] = useState({ unreadNotices: [], otherAlerts: [] });
    const navigate = useNavigate();

    useEffect(() => {
        if (!userId) return;

        const fetchAlerts = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}${NOTICE_SERVICE}/noticeboard/alerts?userId=${userId}`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });

                if (!res.ok) {
                    const errorText = await res.text();
                    throw new Error(`서버 응답 오류: ${res.status} ${errorText}`);
                }

                const data = await res.json();
                setAlerts(data);
            } catch (err) {
                console.error('알림 목록 불러오기 실패:', err);
            }
        };

        fetchAlerts();
    }, [userId]);

    return (
        <div className="alert-page">
            <h2>🔔 알림센터</h2>

            <section>
                <h3>📢 읽지 않은 공지글</h3>
                {alerts.unreadNotices.length > 0 ? (
                    <ul>
                        {alerts.unreadNotices.map(notice => (
                            <li key={notice.id} onClick={() => navigate(`/noticeboard/${notice.id}`)}>
                                {notice.title} <small>({notice.createdAt?.substring(0, 10)})</small>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>읽지 않은 공지글이 없습니다.</p>
                )}
            </section>

            <section>
                <h3>📌 기타 알림</h3>
                <p>아직 알림이 없습니다.</p>
            </section>
        </div>
    );
};

export default NoticeAlertPage;
