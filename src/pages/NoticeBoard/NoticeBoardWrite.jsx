import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import './NoticeBoard.scss';
import { UserContext, UserContextProvider } from '../../context/UserContext';
import { API_BASE_URL, NOTICE_SERVICE } from '../../configs/host-config';

const NoticeBoardWrite = ({ isEdit = false }) => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [type, setType] = useState('post');
    const [files, setFiles] = useState([]);

    const { accessToken, userId, isInit, userRole } = useContext(UserContext); // ✅ 한 번에 구조 분해

    // 수정 모드일 경우 게시글 불러오기
    useEffect(() => {
        if (isEdit && id) {
            axios.get(`${API_BASE_URL}${NOTICE_SERVICE}/noticeboard/${id}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
            })
                .then((res) => {
                    setTitle(res.data.title ?? '');
                    setContent(res.data.content ?? '');
                    setType(res.data.notice ? 'notice' : 'post');
                })
                .catch(err => {
                    console.error(err);
                    alert('게시글을 불러오지 못했습니다.');
                });
        }
    }, [isEdit, id, accessToken]);


    const handleSubmit = async () => {
        const uploadedFileUrls = [];

        try {

            // ✅ 파일이 있다면 presigned URL 받아서 직접 업로드
            if (files.length > 0) {
                for (const file of files) {
                    // 1. presigned URL 요청
                    const res = await axios.get(`${API_BASE_URL}${NOTICE_SERVICE}/noticeboard/upload-url`, {
                        params: { fileName: file.name },
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    });

                    const presignedUrl = res.data;

                    // 2. S3에 파일 업로드
                    await axios.put(presignedUrl, file, {
                        headers: {
                            'Content-Type': file.type,
                        },
                    });

                    // 3. 업로드된 S3의 정적 URL 추출
                    const uploadedUrl = presignedUrl.split('?')[0];
                    uploadedFileUrls.push(uploadedUrl);
                }
            }


            // ✅ 게시글 데이터 구성
            const noticeData = {
                title,
                content,
                notice: type === 'notice',
                attachmentUri: uploadedFileUrls.length > 0 ? JSON.stringify(uploadedFileUrls) : null,
            };

        
            console.log('noticeData : ', noticeData);
            if (isEdit) {
                await axios.put(`${API_BASE_URL}${NOTICE_SERVICE}/noticeboard/${id}`, noticeData, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    },
                });
                alert('수정되었습니다!');
            } else {
                await axios.post(`${API_BASE_URL}${NOTICE_SERVICE}/noticeboard/write`, noticeData, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    },
                });
                alert('저장되었습니다!');
            }

            navigate('/noticeboard');
        } catch (err) {
            console.error(err);
            alert('저장 또는 수정에 실패했습니다.');
        }
    };


    return (
        <div className="notice-write">
            <h2>{isEdit ? '게시글 수정' : '게시글 작성'}</h2>
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
                        disabled={userRole !== 'ADMIN'}
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
                <input type="file" multiple onChange={(e) => setFiles([...e.target.files])} />
            </div>

            <div className="buttons">
                <button onClick={handleSubmit}>{isEdit ? '수정' : '저장'}</button>
                <button onClick={() => navigate(-1)}>뒤로가기</button>
            </div>
        </div>
    );
};

export default NoticeBoardWrite;