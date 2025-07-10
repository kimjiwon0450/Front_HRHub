import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    API_BASE_URL,
    NOTICE_SERVICE
} from '../../configs/host-config';
import { UserContext } from '../../context/UserContext';
import './NoticeBoardDetail.scss';

const NoticeBoardDetail = () => {
    const { id } = useParams();
    const [posts, setPosts] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthor, setIsAuthor] = useState(false); // ✅ 상태값으로 분리
    const [attachments, setAttachments] = useState([]);
    

    const { accessToken, userId, isInit } = useContext(UserContext);
    const navigate = useNavigate();

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
        navigate(-1); // 뒤로가기
    };

    const isImageFile = (url) => {
        return /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(url);
    };

    // 파일 다운로드 유틸 함수
    const forceDownload = async (url, filename) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();

            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            alert('파일 다운로드에 실패했습니다.');
            console.error(error);
        }
    };


    useEffect(() => {
        if (!isInit || !accessToken) return;

        const fetchPost = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}${NOTICE_SERVICE}/noticeboard/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });

                const data = await res.json();
                setPosts(data); // ✅ posts를 여기서만 세팅

                console.log('data : ', data);
                console.log('data.employeeId : ', data.employeeId);
                console.log('userId : ', userId);

                // ✅ 첨부파일 파싱
                let attachments = [];
                if (data.attachmentUri) {
                    try {
                        if (data.attachmentUri.trim().startsWith('[')) {
                            // JSON 배열인 경우
                            const parsed = JSON.parse(data.attachmentUri);
                            attachments = Array.isArray(parsed) ? parsed : [parsed];
                        } else {
                            // 쉼표 구분 문자열인 경우
                            attachments = data.attachmentUri.split(',').map(url => url.trim());
                        }
                    } catch (e) {
                        console.error('첨부파일 파싱 실패', e);
                        attachments = [];
                    }
                }
                setAttachments(attachments);

                // ✅ 읽음 처리
                await fetch(`${API_BASE_URL}${NOTICE_SERVICE}/noticeboard/${id}/read`, {
                    method: 'POST',
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
    }, [id, accessToken, isInit, userId]);

    // ✅ 수정된 부분: posts가 세팅된 이후에만 작성자 여부 판단
    useEffect(() => {
        if (posts && userId) {
            if (posts.employeeId === Number(userId)) {
                setIsAuthor(true);
                console.log('작성자 맞음!');
            } else {
                console.log('작성자 아님!');
            }
        }
    }, [posts, userId]); // ✅ 여기서만 판단하도록 분리

    if (loading) return <p>불러오는 중...</p>;
    if (!posts) return <p>게시글을 찾을 수 없습니다.</p>;

    console.log('posts : ', posts);


    return (
        <div className="notice-detail">
            <h2>{posts.notice ? '[공지] ' : ''}{posts.title}</h2>
            <div className="meta-with-attachment">
                <div className="meta">
                    <p>작성자 : {posts.name}{posts.employStatus === 'INACTIVE' ? '(퇴사)' : ''}</p>
                    <p>부서 : {posts.departmentName}</p>
                    <p>등록일 : {posts.createdAt?.substring(0, 10)}</p>
                    <p>조회수 : {posts.viewCount}</p>
                </div>
                {attachments.length > 0 && (
                    <div className="attachment-link">
                        {attachments.map((url, idx) => (
                        <div key={idx} >
                            <a
                                // href="#!"
                                // onClick={() => forceDownload(url, url.split('/').pop())}
                                // rel="noopener noreferrer"

                                href={url}
                                download={url.split('/').pop()}
                                rel="noopener noreferrer"
                                target="_blank"

                            >
                            📎 {url.split('/').pop()}
                            </a>
                        </div>
                        ))}
                    </div>
                    )
                }
            </div>
            <hr />
            <div className="content">{posts.content}</div>

            <hr />

            {/* ✅ 첨부파일 미리보기 */}
            {attachments.length > 0 && (
                <div className="attachments">
                    {attachments.map((url, idx) => (
                        <div key={idx} style={{ marginBottom: '10px' }}>
                            {isImageFile(url) ? (
                                <img
                                    src={url}
                                    alt={`attachment-${idx}`}
                                    style={{ maxWidth: '100%', borderRadius: '8px' }}
                                />
                                
                                ) : (
                                <a href="#!" onClick={() => forceDownload(url, url.split('/').pop())}>
                                    📎 파일 다운로드 {url.split('/').pop()}
                                </a>
                                )
                            }
                        </div>
                    ))}
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
