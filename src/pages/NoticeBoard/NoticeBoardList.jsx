import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    API_BASE_URL,
    NOTICE_SERVICE
} from '../../configs/host-config';
import { UserContext } from '../../context/UserContext'; // 로그인 유저 정보
import './NoticeBoard.scss';

const NoticeBoardList = () => {
    const navigate = useNavigate();
    const { isInit, departmentId } = useContext(UserContext);

    const [posts, setPosts] = useState([]);
    const [notices, setNotices] = useState([]);
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        keyword: '',
        sortBy: 'createdAt',
        sortDir: 'desc',
    });
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            try {
                const { keyword, startDate, endDate, sortBy, sortDir } = filters;
                const params = new URLSearchParams({
                    keyword,
                    fromDate: startDate,
                    toDate: endDate,
                    sortBy,
                    sortDir,
                    page,
                    size: 10
                });

                let url = '';
                if (departmentId) {
                    url = `${API_BASE_URL}${NOTICE_SERVICE}/noticeboard/department/${departmentId}?${params.toString()}`;
                } else {
                    url = `${API_BASE_URL}${NOTICE_SERVICE}/noticeboard?${params.toString()}`;
                }

                const res = await fetch(url, { credentials: 'include' });
                if (!res.ok) throw new Error(`서버 오류: ${res.status}`);
                const data = await res.json();

                setNotices(data.notices || []);
                setPosts(data.posts || []);
                setTotalPages(data.totalPages || 1);
            } catch (err) {
                console.error('게시글 불러오기 실패:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [filters, page, departmentId, isInit]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleSearch = () => setPage(0);

    return (
        <div className="notice-board">
            <div className="header">
                <h2>게시판</h2>
                <div className="filters">
                    <input type="date" name="startDate" value={filters.startDate} onChange={handleInputChange} />
                    <input type="date" name="endDate" value={filters.endDate} onChange={handleInputChange} />
                    <input type="text" name="keyword" value={filters.keyword} placeholder="제목 검색" onChange={handleInputChange} />
                    <select name="sortBy" value={filters.sortBy} onChange={handleInputChange}>
                        <option value="createdAt">등록일</option>
                        <option value="title">제목</option>
                    </select>
                    <select name="sortDir" value={filters.sortDir} onChange={handleInputChange}>
                        <option value="desc">내림차순</option>
                        <option value="asc">오름차순</option>
                    </select>
                    <button onClick={handleSearch}>검색</button>
                    <button className="write-button" onClick={() => navigate('/noticeboard/write')}>작성하기</button>
                </div>
            </div>

            {loading ? (
                <p>불러오는 중...</p>
            ) : (
                <>
                    <ul className="post-list">
                        {notices.length > 0 && (
                            <li className="notice-header">
                                <span>공지</span>
                                <span>제목</span>
                                <span>작성자</span>
                                <span>작성일</span>
                                <span>조회수</span>
                            </li>
                        )}
                        {notices.map(post => (
                            <li key={`notice-${post.id}`} className="notice" onClick={() => navigate(`/noticeboard/${post.id}`)}>
                                <span>[공지]</span>
                                <span>{post.title}</span>
                                <span>{post.writerName}</span>
                                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                <span>{post.viewCount}</span>
                            </li>
                        ))}
                        {posts.length > 0 ? (
                            posts.map(post => (
                                <li key={`post-${post.id}`} onClick={() => navigate(`/noticeboard/${post.id}`)}>
                                    <span></span>
                                    <span>{post.title}</span>
                                    <span>{post.writer}</span>
                                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                    <span>{post.viewCount}</span>
                                </li>
                            ))
                        ) : (
                            <li className="no-post">게시글이 없습니다</li>
                        )}
                    </ul>

                    <div className="pagination">
                        <button onClick={() => setPage(p => Math.max(p - 1, 0))} disabled={page === 0}>Previous</button>
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button key={i} className={page === i ? 'active' : ''} onClick={() => setPage(i)}>
                                {i + 1}
                            </button>
                        ))}
                        <button onClick={() => setPage(p => Math.min(p + 1, totalPages - 1))} disabled={page === totalPages - 1}>Next</button>
                    </div>
                </>
            )}
        </div>
    );
};

export default NoticeBoardList;
