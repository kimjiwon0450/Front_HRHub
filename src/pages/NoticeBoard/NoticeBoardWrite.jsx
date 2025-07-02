import React from 'react';
import './NoticeBoard.scss';

const NoticeBoardWrite = () => {
    return (
        <div className="notice-write">
            <h2>공지사항 &gt;</h2>
            <input type="text" placeholder="제목을 입력하세요" className="title-input" />
            <textarea placeholder="내용을 입력하세요" className="content-textarea" />

            <div className="options">
                <label>
                    <input type="radio" name="type" value="notice" /> 공지글
                </label>
                <label>
                    <input type="radio" name="type" value="post" defaultChecked /> 일반글
                </label>
            </div>

            <div className="attachments">
                <input type="file" />
            </div>

            <div className="buttons">
                <button>저장</button>
                <button>뒤로가기</button>
            </div>
        </div>
    );
};

export default NoticeBoardWrite;