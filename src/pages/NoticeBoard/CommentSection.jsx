import React, { useState, useEffect } from 'react';
import CommentForm from './CommentForm';
import CommentItem from './CommentItem';

const CommentSection = ({ noticeId, currentUserId, accessToken }) => {
    const [comments, setComments] = useState([]);

    const fetchComments = async () => {
        try {
            const res = await fetch(`/notice/noticeboard/${noticeId}/comments`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            const data = await res.json();
            setComments(data);
        } catch (e) {
            console.error('댓글 불러오기 실패:', e);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [noticeId]);

    const handleAdd = async (comment) => {
        try {
            await fetch(`/notice/noticeboard/${noticeId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    ...comment,
                    writerId: currentUserId,
                    writerName: '익명' // 혹은 context에서 사용자 이름 넘겨줘도 됨
                })
            });
            fetchComments();
        } catch (e) {
            alert('댓글 등록 실패');
        }
    };

    const handleUpdate = async (commentId, content) => {
        try {
            await fetch(`/notice/noticeboard/${noticeId}/comments/${commentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({ content })
            });
            fetchComments();
        } catch (e) {
            alert('댓글 수정 실패');
        }
    };

    const handleDelete = async (commentId) => {
        if (!window.confirm('댓글을 삭제하시겠습니까?')) return;
        try {
            await fetch(`/notice/noticeboard/${noticeId}/comments/${commentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            fetchComments();
        } catch (e) {
            alert('댓글 삭제 실패');
        }
    };

    return (
        <div className="comment-section">
            <h4>댓글 {comments.length}</h4>
            <CommentForm onSubmit={handleAdd} />
            <div className="comment-list">
                {comments.map(c => (
                    <CommentItem
                        key={c.id}
                        comment={c}
                        isMine={c.writerId === currentUserId}
                        onUpdate={handleUpdate}
                        onDelete={handleDelete}
                    />
                ))}
            </div>
        </div>
    );
};

export default CommentSection;
