import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './EvaluationForm.scss';
import axiosInstance from '../../configs/axios-config';
import { API_BASE_URL, HR_SERVICE } from '../../configs/host-config';
import { useContext } from 'react';
import { UserContext } from '../../context/UserContext';

// 별점 컴포넌트
function StarRating({ value, onChange }) {
  return (
    <span className='star-row'>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          style={{
            cursor: 'pointer',
            color: n <= value ? '#ffba08' : '#ccc',
            fontSize: '1.35em',
          }}
          onClick={() => onChange(n)}
          title={n + '점'}
        >
          {n <= value ? '★' : '☆'}
        </span>
      ))}
    </span>
  );
}

export default function EvaluationForm({ employee, onClose }) {
  const { userId } = useContext(UserContext);
  // 폼 상태 관리
  const [form, setForm] = useState({
    name: '',
    dept: '',
    date: new Date(),
    template: {
      leadership: 1,
      creativity: 1,
      cooperation: 1,
      problem: 1,
    },
    comment: '',
  });

  // 평가자 이름 상태 추가
  const [evaluatorName, setEvaluatorName] = useState('');

  console.log(employee, '여기임');

  useEffect(() => {
    if (employee) {
      setForm((prev) => ({
        ...prev,
        name: `${employee.name} (${employee.role})`,
        dept: employee.department || '',
      }));
    }
  }, [employee]);

  // 평가자 이름 조회
  useEffect(() => {
    async function fetchEvaluatorName() {
      if (!userId) return;
      try {
        const res = await axiosInstance.get(
          `${API_BASE_URL}${HR_SERVICE}/employees/${userId}/name`,
        );
        setEvaluatorName(res.data.result);
      } catch (error) {
        setEvaluatorName('');
      }
    }
    fetchEvaluatorName();
  }, [userId]);

  // 사이드 패널 상태
  const [approval, setApproval] = useState('박지수(인사)');
  const [shareType, setShareType] = useState('전체');
  const [searchEmp, setSearchEmp] = useState('');

  // 별점
  const handleStar = (key, val) =>
    setForm((prev) => ({
      ...prev,
      template: {
        ...prev.template,
        [key]: val,
      },
    }));

  // 평균점수
  const avg = (
    (form.template.leadership +
      form.template.creativity +
      form.template.cooperation +
      form.template.problem) /
    4
  ).toFixed(1);

  // 날짜 삭제
  const handleDateClear = () => setForm((prev) => ({ ...prev, date: null }));

  // 입력
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // 제출 등 이벤트 (실제 로직 연결 가능)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post(
        `${API_BASE_URL}${HR_SERVICE}/evaluation/${employee.employeeId}`,
        {
          evaluateeId: employee.employeeId,
          evaluatorId: userId,
          template: JSON.stringify({
            leadership: form.template.leadership,
            creativity: form.template.creativity,
            cooperation: form.template.cooperation,
            problem: form.template.problem,
          }),
          comment: form.comment,
          totalEvaluation: Number(avg),
          interviewDate: form.date,
        },
      );
      alert('평가등록 완료');
      if (onClose) onClose();
    } catch (error) {
      alert('제출 실패: ' + (error.response?.data?.message || error.message));
    }
  };
  const handleSave = () => alert('임시저장: ' + JSON.stringify(form, null, 2));
  const handlePreview = () => alert('미리보기 (팝업 구현 가능)');
  const handleCancel = () => {
    if (window.confirm('취소하시겠습니까?')) {
      if (onClose) {
        onClose();
      } else {
        window.location.reload();
      }
    }
  };

  return (
    <div className='eval-root'>
      <div className='eval-header'>
        <button className='back-btn' type='button' onClick={handleCancel}>
          ◀
        </button>
        <div className='eval-title'>인사평가표</div>
        <div className='eval-searchbar'>
          <select>
            <option>전체</option>
          </select>
          <input type='text' placeholder='검색' />
          <button className='icon-search'>🔍</button>
        </div>
      </div>

      <div className='eval-main'>
        {/* 평가 입력폼 */}
        <div className='eval-form-box'>
          <div className='eval-form-title'>인사평가표</div>
          <hr />
          <form onSubmit={handleSubmit} autoComplete='off'>
            <div className='eval-field'>
              <label>사원명</label>
              <input type='text' name='name' value={form.name} readOnly />
            </div>
            <div className='eval-field'>
              <label>소속부서</label>
              <input type='text' name='dept' value={form.dept} readOnly />
            </div>
            <div className='eval-field'>
              <label>면담일시</label>
              <div className='eval-date-group'>
                <DatePicker
                  dateFormat='yyyy.MM.dd'
                  selected={form.date}
                  onChange={(date) => setForm((prev) => ({ ...prev, date }))}
                  placeholderText='날짜 선택'
                  className='datepicker-input'
                  isClearable
                />
                <button
                  type='button'
                  className='eval-date-clear'
                  title='날짜 삭제'
                  onClick={handleDateClear}
                  tabIndex={-1}
                >
                  ❌
                </button>
                <button
                  type='button'
                  className='eval-date-picker'
                  title='달력 선택'
                  tabIndex={-1}
                  // react-datepicker 사용 중이면 필요 없음
                >
                  🗓️
                </button>
              </div>
            </div>
            <div className='eval-field'>
              <label>평가자</label>
              <input
                type='text'
                name='evaluator'
                value={evaluatorName || ''}
                readOnly
              />
            </div>
            <div className='eval-field stars'>
              <label>리더십</label>
              <StarRating
                value={form.template.leadership}
                onChange={(v) => handleStar('leadership', v)}
              />
            </div>
            <div className='eval-field stars'>
              <label>창의성</label>
              <StarRating
                value={form.template.creativity}
                onChange={(v) => handleStar('creativity', v)}
              />
            </div>
            <div className='eval-field stars'>
              <label>협업능력</label>
              <StarRating
                value={form.template.cooperation}
                onChange={(v) => handleStar('cooperation', v)}
              />
            </div>
            <div className='eval-field stars'>
              <label>문제해결능력</label>
              <StarRating
                value={form.template.problem}
                onChange={(v) => handleStar('problem', v)}
              />
            </div>
            <div className='eval-field'>
              <label>총평</label>
              <textarea
                name='comment'
                value={form.comment}
                onChange={handleChange}
              />
            </div>
            <div className='eval-field avg'>
              <span>평균 점수</span>
              <span className='avg-score'>{avg}</span>
            </div>
          </form>
        </div>

        {/* 오른쪽 사이드 패널 */}
        <div className='eval-side-panel'>
          {/* 결재선 */}
          <div className='side-box side-approval'>
            <div className='side-title'>
              결재선
              <button className='side-view-btn'>보기</button>
              <button className='side-setting-btn'>설정 ▼</button>
            </div>
          </div>
          {/* 참조 */}
          <div className='side-box side-reference'>
            <div className='side-title'>참조</div>
            <input
              className='side-input'
              value={approval}
              readOnly
              style={{ background: '#eee' }}
            />
          </div>
          {/* 일부 공유 */}
          <div className='side-box side-share'>
            <div className='side-title'>
              일부 공유
              <button className='side-view-btn'>보기</button>
              <button className='side-setting-btn'>설정 ▼</button>
            </div>
          </div>
          <div className='side-box'>
            <button
              className={`btn dark${shareType === '전체' ? ' active' : ''}`}
              onClick={() => setShareType('전체')}
              type='button'
            >
              전체공유
            </button>
            <button
              className={`btn dark${shareType === '일부' ? ' active' : ''}`}
              onClick={() => setShareType('일부')}
              type='button'
            >
              일부공유
            </button>
          </div>
          {/* 사원 검색 */}
          <div className='side-box'>
            <div className='side-row'>
              <label>사원</label>
              <input
                className='side-input'
                placeholder='사원명을 입력하세요'
                value={searchEmp}
                onChange={(e) => setSearchEmp(e.target.value)}
              />
              <button className='icon-search' type='button'>
                🔍
              </button>
            </div>
            <input className='side-input' style={{ marginTop: '0.7rem' }} />
          </div>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className='eval-footer-btns'>
        <button className='btn dark' type='button' onClick={handleCancel}>
          취소
        </button>
        <button className='btn dark' type='button' onClick={handlePreview}>
          미리보기
        </button>
        <button className='btn dark' type='button' onClick={handleSave}>
          임시저장
        </button>
        <button className='btn blue' type='button' onClick={handleSubmit}>
          평가등록
        </button>
      </div>
    </div>
  );
}
