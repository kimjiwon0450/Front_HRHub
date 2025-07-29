import React, { useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { API_BASE_URL, COMMUNITY_SERVICE } from '../../configs/host-config';
import { UserContext } from '../../context/UserContext';
import './CommunityReport.scss';

const CommunityReport = () => {
    const { communityId } = useParams();
    const navigate = useNavigate();
    const { accessToken } = useContext(UserContext);

    const [reason, setReason] = useState('');
    const [details, setDetails] = useState('');

    const handleSubmit = async () => {
        if (!reason) {
            Swal.fire({
                icon: 'warning',
                title: '신고 사유를 선택해 주세요.',
            });
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}${COMMUNITY_SERVICE}/${communityId}/report`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    reason,
                    details,
                }),
            });

            if (!res.ok) throw new Error('신고 요청 실패');

            Swal.fire({
                icon: 'success',
                title: '신고가 접수되었습니다.',
            }).then(() => {
                navigate(-1);
            });
        } catch (err) {
            console.error(err);
            Swal.fire({
                icon: 'error',
                title: '신고 처리 중 오류가 발생했습니다.',
            });
        }
    };

    return (
        <div className="community-report">
            <h2>게시글 신고하기</h2>

            <label htmlFor="reason">신고 사유</label>
            <select
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
            >
                <option value="">-- 신고 사유를 선택하세요 --</option>
                <option value="spam">스팸/홍보성</option>
                <option value="abuse">욕설/비방</option>
                <option value="illegal">불법정보</option>
                <option value="privacy">개인정보 침해</option>
                <option value="other">기타</option>
            </select>

            <label htmlFor="details">상세 내용 (선택)</label>
            <textarea
                id="details"
                placeholder="신고 내용을 자세히 작성해 주세요."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
            />

            <div className="buttons">
                <button onClick={handleSubmit}>신고 제출</button>
                <button onClick={() => navigate(-1)}>취소</button>
            </div>
        </div>
    );
};

export default CommunityReport;
