/**
 * components/Skeleton.js
 * Animated skeleton placeholders for loading states.
 * Prevents layout shift and gives users visual feedback.
 *
 * Usage:
 *   <Skeleton width="100%" height={20} />
 *   <Skeleton variant="circle" size={48} />
 *   <SkeletonCard />        ← pre-built evidence card skeleton
 *   <SkeletonStat />        ← pre-built stat card skeleton
 */

import React from 'react';
import './Skeleton.css';

// Base skeleton block
export const Skeleton = ({
  width = '100%',
  height = 16,
  borderRadius = 6,
  variant = 'rect',
  size,        // for circles
  style = {},
}) => {
  if (variant === 'circle') {
    return (
      <div
        className="skeleton"
        style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0, ...style }}
      />
    );
  }
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius, ...style }}
    />
  );
};

// Pre-built: stat card skeleton
export const SkeletonStat = () => (
  <div className="skeleton-stat-card">
    <Skeleton width="60%" height={11} style={{ marginBottom: 10 }} />
    <Skeleton width="40%" height={34} style={{ marginBottom: 8 }} />
    <Skeleton width="50%" height={11} />
  </div>
);

// Pre-built: evidence item skeleton
export const SkeletonEvidenceItem = () => (
  <div className="skeleton-ev-item">
    <Skeleton variant="circle" size={52} style={{ borderRadius: 10 }} />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Skeleton width="55%" height={14} />
      <Skeleton width="90%" height={12} />
      <Skeleton width="35%" height={11} />
    </div>
  </div>
);

// Pre-built: full dashboard skeleton
export const SkeletonDashboard = () => (
  <div>
    <Skeleton width="40%" height={28} style={{ marginBottom: 8 }} />
    <Skeleton width="25%" height={14} style={{ marginBottom: 28 }} />
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
      <SkeletonStat /><SkeletonStat /><SkeletonStat /><SkeletonStat />
    </div>
    <Skeleton width="30%" height={17} style={{ marginBottom: 14 }} />
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: 14, marginBottom: 28 }}>
      {[1,2,3,4].map(i => (
        <div key={i} className="skeleton-feature-card">
          <Skeleton variant="circle" size={36} style={{ margin: '0 auto 12px' }} />
          <Skeleton width="70%" height={14} style={{ margin: '0 auto 6px' }} />
          <Skeleton width="90%" height={12} style={{ margin: '0 auto' }} />
        </div>
      ))}
    </div>
    <div className="skeleton-list-card">
      <Skeleton width="35%" height={17} style={{ marginBottom: 16 }} />
      {[1,2,3].map(i => <SkeletonEvidenceItem key={i} />)}
    </div>
  </div>
);

export default Skeleton;