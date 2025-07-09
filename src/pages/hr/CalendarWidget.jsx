import React from 'react';

export default function CalendarWidget({
  calendarDate,
  setCalendarDate,
  today,
  calendarMatrix,
  monthNames,
  handlePrevMonth,
  handleNextMonth,
  year,
  month,
}) {
  return (
    <div className='calendar-mock'>
      <div className='calendar-title'>
        <button
          style={{
            border: 'none',
            background: 'none',
            fontSize: '1.1em',
            cursor: 'pointer',
          }}
          onClick={handlePrevMonth}
        >
          &lt;
        </button>
        {monthNames[month]} {year}
        <button
          style={{
            border: 'none',
            background: 'none',
            fontSize: '1.1em',
            cursor: 'pointer',
          }}
          onClick={handleNextMonth}
        >
          &gt;
        </button>
      </div>
      <table>
        <thead>
          <tr>
            <th>Mo</th>
            <th>Tu</th>
            <th>We</th>
            <th>Th</th>
            <th>Fr</th>
            <th>Sa</th>
            <th>Su</th>
          </tr>
        </thead>
        <tbody>
          {calendarMatrix.map((row, i) => (
            <tr key={i}>
              {row.map((date, j) => (
                <td
                  key={j}
                  style={
                    date &&
                    today.getFullYear() === year &&
                    today.getMonth() === month &&
                    today.getDate() === date
                      ? {
                          background: '#2b80ff',
                          color: '#fff',
                          borderRadius: '50%',
                        }
                      : undefined
                  }
                >
                  {date || ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
