import React from 'react';

export default function NoticeList({ notices }) {
  return (
    <ul className='notice-list'>
      {notices.map((notice, idx) => (
        <li key={idx}>{notice}</li>
      ))}
    </ul>
  );
}
