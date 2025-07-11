import React from 'react';
import { useNavigate } from 'react-router-dom';
import './NoticeList.scss';

export default function NoticeList({ notices }) {
  const navigate = useNavigate();

  if (!notices || notices.length === 0) {
    return <p className='no-notice'>공지사항이 없습니다.</p>;
  }

  return (
    <table className='notice-list'>
      <tbody>
        {notices.map((notice) => (
          <tr
            key={notice.id}
            className='notice-item'
            onClick={() => navigate(`/noticeboard/${notice.id}`)}
          >
            <td className='notice-title'>{notice.title}</td>
            <td className='notice-author'>
              {notice.employStatus === 'INACTIVE'
                ? `${notice.name}(퇴사)`
                : notice.name}
            </td>
            <td className='notice-date'>
              {new Date(notice.createdAt).toLocaleDateString()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}





// {notices.map((notice) => (
//   <li
//     key={notice.id}
//     className='notice-item'
//     onClick={() => navigate(`/noticeboard/${notice.id}`)}
//     style={{ cursor: 'pointer' }}
//   >
//     📌 {notice.title}
//   </li>
// ))}