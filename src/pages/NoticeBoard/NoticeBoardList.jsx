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

    const [viewMode, setViewMode] = useState('ALL'); // ALL | MY | DEPT
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
    const [pageSize, setPageSize] = useState(10); // ✅ 보기 개수
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

                let url;
                // if (departmentId != null && departmentId !== 'undefined') {
                //     url = `${API_BASE_URL}${NOTICE_SERVICE}/noticeboard/department/${departmentId}?${params.toString()}`;
                // } else {
                //     url = `${API_BASE_URL}${NOTICE_SERVICE}/noticeboard?${params.toString()}`;
                // }

                if (viewMode === 'MY') {
                    url = `${API_BASE_URL}${NOTICE_SERVICE}/noticeboard/my`;
                } else if (viewMode === 'DEPT') {
                    url = `${API_BASE_URL}${NOTICE_SERVICE}/noticeboard/department`;
                } else {
                    if (departmentId != null && departmentId !== 'undefined') {
                        url = `${API_BASE_URL}${NOTICE_SERVICE}/noticeboard/department/${departmentId}?${params.toString()}`;
                    } else {
                        url = `${API_BASE_URL}${NOTICE_SERVICE}/noticeboard?${params.toString()}`;
                    }
                }

                const res = await fetch(url, { credentials: 'include' });
                if (!res.ok) throw new Error(`서버 오류: ${res.status}`);
                const data = await res.json();

                console.log('data : ', data);
                console.log('data.notices : ', data.notices);
                console.log('data.posts : ', data.posts);

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
    }, [filters, page, pageSize, departmentId, isInit]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleSearch = () => setPage(0);
    const handlePageSizeChange = (e) => {
        setPageSize(Number(e.target.value));
        setPage(0); // 첫 페이지로 초기화
    };

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

                    <div className="view-mode-buttons">
                        <button className={viewMode === 'ALL' ? 'active' : ''} onClick={() => { setViewMode('ALL'); setPage(0); }}>
                            전체
                        </button>
                        <button className={viewMode === 'MY' ? 'active' : ''} onClick={() => { setViewMode('MY'); setPage(0); }}>
                            내가 쓴 글
                        </button>
                        <button className={viewMode === 'DEPT' ? 'active' : ''} onClick={() => { setViewMode('DEPT'); setPage(0); }}>
                            내 부서 글
                        </button>
                    </div>

                </div>
            </div>

            {loading ? (
                <p>불러오는 중...</p>
            ) : (
                <>
                    <table className="notice-table">
                        <thead>
                            <tr>
                                <th>구분</th>
                                <th>제목</th>
                                <th>작성자</th>
                                <th>작성일</th>
                                <th>조회수</th>
                            </tr>
                        </thead>
                        <tbody>
                            {notices.map(post => (
                                <tr key={`notice-${post.id}`} className="notice-row" onClick={() => navigate(`/noticeboard/${post.id}`)}>
                                    <td>[공지]</td>
                                    <td>{post.title}</td>
                                    <td>{post.name}</td>
                                    <td>{new Date(post.createdAt).toLocaleDateString()}</td>
                                    <td>{post.viewCount}</td>
                                </tr>
                            ))}

                            {/* 🔻 공지와 일반글 사이 구분선 추가 */}
                            {notices.length > 0 && posts.length > 0 && (
                                <tr className="divider-row">
                                    <td colSpan="5"><hr /></td>
                                </tr>
                            )}

                            {posts.length > 0 ? (
                                posts.map(post => (
                                    <tr key={`post-${post.id}`} onClick={() => navigate(`/noticeboard/${post.id}`)}>
                                        <td></td>
                                        <td>{post.title}</td>
                                        <td>{post.name}</td>
                                        <td>{new Date(post.createdAt).toLocaleDateString()}</td>
                                        <td>{post.viewCount}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="no-post">게시글이 없습니다</td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    <div className="pagination">
                        <button onClick={() => setPage(p => Math.max(p - 1, 0))} disabled={page === 0}>Previous</button>
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button key={i} className={page === i ? 'active' : ''} onClick={() => setPage(i)}>
                                {i + 1}
                            </button>
                        ))}
                        <button onClick={() => setPage(p => Math.min(p + 1, totalPages - 1))} disabled={page === totalPages - 1}>Next</button>
                    </div>

                    <div className="page-size-selector">
                        <label>보기 개수:&nbsp;</label>
                        <select value={pageSize} onChange={handlePageSizeChange}>
                            {[10, 15, 20, 25, 30].map(size => (
                                <option key={size} value={size}>{size}개씩 보기</option>
                            ))}
                        </select>
                    </div>
                </>
            )}
        </div>
    );
};

export default NoticeBoardList;
