import React from 'react';
import './bars.css';

export default function Button(props) {
  const { icon, text, action, cursor, status } = props;
  return (
    <div className={`btn-bar ${status}`} onClick={action} title={text} style={{ cursor: cursor !== null ? cursor : 'inherit' }}>
      <i className={`${icon}`} />
      {/* <span>{text}</span> */}
    </div>
  );
}