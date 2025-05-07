import React from 'react';
import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = '#007bff',
  fullScreen = false,
}) => {
  const spinnerClass = `spinner ${size} ${fullScreen ? 'fullscreen' : ''}`;
  
  return (
    <div className={spinnerClass}>
      <div className="spinner-inner" style={{ borderTopColor: color }}>
        <div className="spinner-circle"></div>
      </div>
    </div>
  );
};

export default LoadingSpinner; 