import React, { useEffect, useState } from 'react';
import axios from '../../utils/customAxios'; // 설정된 axios 인스턴스 사용
import Swal from 'sweetalert2';
import PostCard from './PostCard'; // 개별 게시글 UI 컴포넌트
import Pagination from '../common/Pagination'; // 페이지네이션 컴포넌트
import './CommunityPostsPage.scss';

const CommunityPostsPage = () => {
    const [posts, setPosts] = useState([]);
    const [keyword, setKeyword] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [page, setPage] = useState(0);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortDir, setSortDir] = useState('desc');

    const fetchPosts = async () => {
        try {
            const res = await axios.get('/notices/community', {
                params: {
                    keyword,
                    fromDate,
                    toDate,
                    page,
                    pageSize,
                    sortBy,
                    sortDir
                }
            });
            setPosts(res.data.posts);
            setTotalPages(res.data.totalPages);
        } catch (err) {
            console.error(err);
            Swal.fire('에러', '게시글을 불러오는 중 문제가 발생했습니다.', 'error');
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [page, sortBy, sortDir]);

    const handleSearch = () => {
        if (!keyword && !fromDate && !toDate) {
            Swal.fire('검색어 필요', '검색 조건을 하나 이상 입력해주세요.', 'warning');
            return;
        }
        setPage(0);
        fetchPosts();
    };

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">커뮤니티 게시글</h2>

            {/* 🔍 필터 영역 */}
            <div className="flex flex-wrap gap-2 items-center mb-4">
                <input
                    type="text"
                    placeholder="검색어"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="border rounded px-3 py-1"
                />
                <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="border rounded px-3 py-1"
                />
                <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="border rounded px-3 py-1"
                />
                <button
                    onClick={handleSearch}
                    className="bg-blue-500 text-white px-4 py-1 rounded"
                >
                    검색
                </button>
            </div>

            {/* 📋 게시글 목록 */}
            <div className="space-y-4">
                {posts.length > 0 ? (
                    posts.map((post) => (
                        <PostCard key={post.id} post={post} />
                    ))
                ) : (
                    <div className="text-gray-600">게시글이 없습니다.</div>
                )}
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            )}
        </div>
    );
};

export default CommunityPostsPage;
