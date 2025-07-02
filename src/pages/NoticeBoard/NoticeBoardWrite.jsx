import React, { useState } from 'react';
import axios from 'axios';
import './NoticeBoard.scss';

const NoticeBoardWrite = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [type, setType] = useState('post');
    const [file, setFile] = useState(null);

    const user = {
        id: 1,
        name: '관리자',
        role: 'ADMIN' // 또는 'USER'
        };

    const handleSubmit = async () => {
        const formData = new FormData();
        const noticeData = {
            title,
            content,
            isNotice: type === 'notice',
        };
        formData.append("data", new Blob([JSON.stringify(noticeData)], { type: "application/json" }));
        if (file) formData.append("file", file);

        try {
            const res = await axios.post('/api/noticeboard/write', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${yourAccessToken}`,
                },
                withCredentials: true,
            });
            alert('저장되었습니다!');
        } catch (err) {
            console.error(err);
            alert('저장 실패');
        }
    };


    return (
        <div className="notice-write">
            <h2>공지사항 &gt;</h2>
            <input
                type="text"
                placeholder="제목을 입력하세요"
                className="title-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
                placeholder="내용을 입력하세요"
                className="content-textarea"
                value={content}
                onChange={(e) => setContent(e.target.value)}
            />

            <div className="options">
                <label>
                    <input
                        type="radio"
                        name="type"
                        value="notice"
                        disabled={user.role !== 'ADMIN'}
                        checked={type === 'notice'}
                        onChange={() => setType('notice')}
                    />
                    공지글
                </label>
                <label>
                    <input
                        type="radio"
                        name="type"
                        value="post"
                        checked={type === 'post'}
                        onChange={() => setType('post')}
                    />
                    일반글
                </label>
            </div>

            <div className="attachments">
                <input type="file" onChange={(e) => setFile(e.target.files[0])} />
            </div>

            <div className="buttons">
                <button onClick={handleSubmit}>저장</button>
                <button onClick={() => window.history.back()}>뒤로가기</button>
            </div>
        </div>
    );
};

export default NoticeBoardWrite;