import React, { useEffect, useState } from 'react';
import './ResourceBar.css';

const ResourceBar = ({
  value,
  maxValue,
  color,
  prefixText,
  suffixText,
  animationSpeed,
  enableEasing,
}) => {
  const [percentage, setPercentage] = useState((value / maxValue) * 100);

  useEffect(() => {
    setPercentage((value / maxValue) * 100);
  }, [value, maxValue]);

  const progressBarStyle = {
    width: enableEasing ? `${percentage}%` : `${(value / maxValue) * 100}%`,
    backgroundColor: color,
    transition: enableEasing ? `width ${animationSpeed}s ease` : 'none',
  };

  return (
    <div className="resource-bar-container">
      <div className="resource-bar">
        <div className="progress-bar" style={progressBarStyle} />
      </div>
      <div className="resource-info">
        {prefixText} {value} / {maxValue} {suffixText}
      </div>
    </div>
  );
};

// Default animation speed is 1 second
ResourceBar.defaultProps = {
  animationSpeed: 1,
  enableEasing: true, // Enable easing animation by default
};

export default ResourceBar;
