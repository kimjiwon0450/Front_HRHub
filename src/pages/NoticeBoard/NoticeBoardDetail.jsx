import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    API_BASE_URL,
    NOTICE_SERVICE
} from '../../configs/host-config';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { UserContext, UserContextProvider } from '../../context/UserContext';



const NoticeBoardDetail = () => {
    const { id } = useParams();
    const [posts, setPosts] = useState(null);
    const [loading, setLoading] = useState(true);
    const { accessToken, userId, isInit } = useContext(UserContext); // ✅ 한 번에 구조 분해

    const navigate = useNavigate();

    const isAuthor = posts?.employeeId === userId;
    console.log('posts : ', posts);
    console.log('posts.employeeId : ', posts?.employeeId);
    console.log('userId : ', userId);

    const handleDelete = async () => {
        if (!window.confirm('정말 삭제하시겠습니까?')) return;

        try {
            const res = await fetch(`${API_BASE_URL}${NOTICE_SERVICE}/noticeboard/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (!res.ok) throw new Error('삭제 실패');

            alert('삭제 완료');
            navigate('/noticeboard');
        } catch (err) {
            console.error('삭제 실패:', err);
            alert('삭제 중 오류 발생');
        }
    };

    const handleEdit = () => {
        navigate(`/noticeboard/edit/${id}`);
    };

    const handleBack = () => {
        navigate(-1); // 또는 navigate('/noticeboard');
    };


    useEffect(() => {
        if (!isInit || !accessToken) return; // 토큰 초기화가 안되었으면 요청하지 않음

        const fetchPost = async () => {
            try {
                console.log("accessToken:", accessToken);
                // ✅ 게시글 조회
                const res = await fetch(`${API_BASE_URL}${NOTICE_SERVICE}/noticeboard/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
                const data = await res.json();
                setPosts(data);

                // ✅ 읽음 처리 API 호출
                await fetch(`${API_BASE_URL}${NOTICE_SERVICE}/noticeboard/${id}/read`, {
                    method: 'POST',
                    // credentials: 'include'
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
            } catch (err) {
                console.error('상세글 조회 실패 또는 읽음 처리 실패:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [id, accessToken, isInit]);

    if (loading) return <p>불러오는 중...</p>;
    if (!posts) return <p>게시글을 찾을 수 없습니다.</p>;

    return (
        <div className="notice-detail">
            <h2>{posts.isNotice ? '[공지] ' : ''}{posts.title}</h2>
            <div className="meta">
                <p>작성자 : {posts.name}</p>
                <p>부서: {posts.departmentName}</p>
                <p>등록일: {posts.createdAt?.substring(0, 10)}</p>
                <p>조회수: {posts.viewCount}</p>
            </div>
            <hr />
            <div className="content">{posts.content}</div>

            {posts.fileUrl && (
                <div className="attachment">
                    <a href={posts.fileUrl} download>📎 첨부파일 다운로드</a>
                </div>
            )}

            {isAuthor && (
                <div className="buttons">
                    <button onClick={handleEdit}>수정</button>
                    <button onClick={handleDelete}>삭제</button>
                </div>
            )}

            <div className="buttons">
                <button onClick={handleBack}>뒤로가기</button>
            </div>

        </div>
    );
};

export default NoticeBoardDetail;