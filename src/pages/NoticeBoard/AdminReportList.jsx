import React, { useEffect, useState, useContext } from 'react';
import { API_BASE_URL } from '../../configs/host-config';
import { UserContext } from '../../context/UserContext';
import Swal from 'sweetalert2';
import './AdminReportList.scss';

const AdminReportList = () => {
    const [pageInfo, setPageInfo] = useState({ totalPages: 0, currentPage: 0 });
    const [reports, setReports] = useState([]);
    const { accessToken } = useContext(UserContext);

    const fetchReports = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/report/admin/list`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (!res.ok) throw new Error('신고 목록 로딩 실패');
            const data = await res.json();
            setReports(data.posts);
            setPageInfo({ totalPages: data.totalPages, currentPage: data.currentPage });
        } catch (err) {
            console.error(err);
            Swal.fire({ icon: 'error', title: '신고 목록을 불러올 수 없습니다.' });
        }
    };

    const handleAction = async (communityId, action) => {
        const actionText = action === 'delete' ? '삭제' : '공개';

        const confirm = await Swal.fire({
            title: `${actionText} 처리하시겠습니까?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: '확인',
            cancelButtonText: '취소',
        });

        if (!confirm.isConfirmed) return;

        try {
            const res = await fetch(`${API_BASE_URL}/report/admin/${communityId}/${action}`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (!res.ok) throw new Error(`${actionText} 처리 실패`);
            Swal.fire({ icon: 'success', title: `${actionText} 처리 완료` });
            fetchReports(); // 목록 새로고침
        } catch (err) {
            console.error(err);
            Swal.fire({ icon: 'error', title: `${actionText} 처리 중 오류` });
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    return (
        <div className="admin-report-wrapper">
            <h2>신고 내역 관리</h2>
            {reports.length === 0 ? (
                <p className="empty">처리되지 않은 신고가 없습니다.</p>
            ) : (
                <table className="report-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>작성자</th>
                            <th>글제목</th>
                            <th>신고자</th>
                            <th>사유</th>
                            <th>처리</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reports.map((report) => (
                            <tr key={report.communityReportId}>
                                <td>{report.communityReportId}</td>
                                <td>{report.name}</td>
                                <td>{report.title}</td>
                                <td>{report.reporterName || '알 수 없음'}</td>
                                <td>{report.reason}</td>
                                <td>
                                    <button
                                        className="btn delete"
                                        onClick={() => handleAction(report.communityId, 'delete')}
                                    >
                                        삭제
                                    </button>
                                    <button
                                        className="btn recover"
                                        onClick={() => handleAction(report.communityId, 'recover')}
                                    >
                                        공개
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default AdminReportList;
