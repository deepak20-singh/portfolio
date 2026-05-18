import { useState, useEffect } from 'react';

export function StatusPill() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () => {
      const d = new Date();
      const opts: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      };
      setTime(d.toLocaleTimeString('en-GB', opts));
    };
    update();
    const t = setInterval(update, 30000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="status">
      <span className="dot"></span>
      <span>Available · Bengaluru {time} IST</span>
    </div>
  );
}
