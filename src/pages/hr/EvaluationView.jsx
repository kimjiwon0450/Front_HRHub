import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './EvaluationForm.scss';

// 별점 컴포넌트 (조회용, 클릭 불가)
function StarRatingView({ value }) {
  return (
    <span className='star-row'>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          style={{
            color: n <= value ? '#ffba08' : '#ccc',
            fontSize: '1.35em',
          }}
        >
          {n <= value ? '★' : '☆'}
        </span>
      ))}
    </span>
  );
}

export default function EvaluationView({ evaluation, onClose }) {
  // evaluation: {
  //   name, dept, date, leadership, creativity, cooperation, problem, comment, avg
  // }
  return (
    <div className='eval-root'>
      <div className='eval-header'>
        <button className='back-btn' onClick={onClose}>
          ◀
        </button>
        <div className='eval-title'>인사평가 조회</div>
      </div>
      <div className='eval-main'>
        {/* 평가 정보 표시 */}
        <div className='eval-form-box'>
          <div className='eval-form-title'>인사평가표</div>
          <hr />
          <form autoComplete='off'>
            <div className='eval-field'>
              <label>사원명</label>
              <input type='text' name='name' value={evaluation.name} readOnly />
            </div>
            <div className='eval-field'>
              <label>소속부서</label>
              <input type='text' name='dept' value={evaluation.dept} readOnly />
            </div>
            <div className='eval-field'>
              <label>면담일시</label>
              <input type='text' value={evaluation.date} readOnly />
            </div>
            <div className='eval-field stars'>
              <label>리더십</label>
              <StarRatingView value={evaluation.leadership} />
            </div>
            <div className='eval-field stars'>
              <label>창의성</label>
              <StarRatingView value={evaluation.creativity} />
            </div>
            <div className='eval-field stars'>
              <label>협업능력</label>
              <StarRatingView value={evaluation.cooperation} />
            </div>
            <div className='eval-field stars'>
              <label>문제해결능력</label>
              <StarRatingView value={evaluation.problem} />
            </div>
            <div className='eval-field'>
              <label>총평</label>
              <textarea name='comment' value={evaluation.comment} readOnly />
            </div>
            <div className='eval-field avg'>
              <span>평균 점수</span>
              <span className='avg-score'>{evaluation.avg}</span>
            </div>
          </form>
        </div>
      </div>
      {/* 하단 버튼 */}
      <div className='eval-footer-btns'>
        <button className='btn dark' type='button' onClick={onClose}>
          닫기
        </button>
      </div>
    </div>
  );
}
