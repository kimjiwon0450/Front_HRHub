import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    API_BASE_URL,
    NOTICE_SERVICE
} from '../../configs/host-config';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { UserContext } from '../../context/UserContext';


const NoticeBoardDetail = () => {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();
    const { userId } = useContext(UserContext); // 로그인 사용자 ID

    const isAuthor = post?.employeeId === userId;

    const handleDelete = async () => {
        if (!window.confirm('정말 삭제하시겠습니까?')) return;

        try {
            const res = await fetch(`${API_BASE_URL}${NOTICE_SERVICE}/noticeboard/${id}`, {
                method: 'DELETE',
                credentials: 'include'
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
        const fetchPost = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}${NOTICE_SERVICE}/noticeboard/${id}`, {
                    credentials: 'include'
                });
                const data = await res.json();
                setPost(data);

                // ✅ 읽음 처리 API 호출
                await fetch(`${API_BASE_URL}${NOTICE_SERVICE}/noticeboard/${id}/read`, {
                    method: 'POST',
                    credentials: 'include'
                });
            } catch (err) {
                console.error('상세글 조회 실패 또는 읽음 처리 실패:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [id]);

    if (loading) return <p>불러오는 중...</p>;
    if (!post) return <p>게시글을 찾을 수 없습니다.</p>;

    return (
        <div className="notice-detail">
            <h2>{post.isNotice ? '[공지] ' : ''}{post.title}</h2>
            <div className="meta">
                <p>작성자 : {post.name}</p>
                <p>부서: {post.departmentName}</p>
                <p>등록일: {post.createdAt?.substring(0, 10)}</p>
            </div>
            <hr />
            <div className="content">{post.content}</div>

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