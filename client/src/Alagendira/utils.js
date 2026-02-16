import React, { useState, useEffect } from 'react';

export const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleString();
};

const getLocalDateTimeValue = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const localDate = new Date(now.getTime() - offset * 60000);
  return localDate.toISOString().slice(0, 16);
};

export const getRailwayTime24 = (date) => {
  const now = new Date(date);

  // Convert to UTC
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;

  // Add IST offset (+5:30)
  const ist = new Date(utc + 330 * 60000);

  // Format 24-hour string: YYYY-MM-DD HH:mm:ss
  const pad = (n) => n.toString().padStart(2, "0");

  const year = ist.getFullYear();
  const month = pad(ist.getMonth() + 1);
  const day = pad(ist.getDate());
  const hours = pad(ist.getHours());
  const minutes = pad(ist.getMinutes());
  const seconds = pad(ist.getSeconds());

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};
const InfoItemTime = ({ label, value, onChange }) => (
  <div className="flex flex-col">
    <label className="text-sm text-gray-600 mb-1">{label}</label>
    <input
      type="datetime-local"
      value={value}
      onChange={onChange}
      className="border rounded px-2 py-1 text-sm text-gray-800"
    />
  </div>
);

export default function DateTimeInputExample({ setCurrentDateTime, currentDateTime }) {

  useEffect(() => {
    setCurrentDateTime(getLocalDateTimeValue());
  }, []);

  return (
    <InfoItemTime
      label="Date & Time"
      value={currentDateTime}
      onChange={(e) => setCurrentDateTime(e.target.value)}
    />
  );
}
