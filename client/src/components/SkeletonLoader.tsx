import React from 'react';
import { Skeleton, Box, Card, CardHeader, CardContent, Grid, useTheme, alpha } from '@mui/material';
import { styled } from '@mui/material/styles';

export type SkeletonVariant = 
  | 'card' 
  | 'table' 
  | 'list' 
  | 'text' 
  | 'chart' 
  | 'dashboard-card'
  | 'profile'
  | 'stats';

interface SkeletonLoaderProps {
  variant?: SkeletonVariant;
  count?: number;
  height?: number | string;
  width?: number | string;
  animation?: 'pulse' | 'wave' | false;
  className?: string;
  style?: React.CSSProperties;
}

// Styled skeleton with subtle gradient animation
const AnimatedSkeleton = styled(Skeleton)(({ theme }) => ({
  '&::after': {
    background: `linear-gradient(90deg, 
      transparent, 
      ${alpha(theme.palette.background.paper, 0.4)}, 
      transparent
    )`,
  },
}));

// Card skeleton with header and content
const CardSkeleton: React.FC = () => (
  <Card>
    <CardHeader
      avatar={<Skeleton variant="circular" width={40} height={40} />}
      title={<Skeleton variant="text" width="60%" height={24} />}
      subheader={<Skeleton variant="text" width="40%" height={20} />}
    />
    <CardContent>
      <Skeleton variant="rectangular" height={118} />
      <Box sx={{ mt: 2 }}>
        <Skeleton variant="text" height={20} />
        <Skeleton variant="text" height={20} width="80%" />
        <Skeleton variant="text" height={20} width="60%" />
      </Box>
    </CardContent>
  </Card>
);

// Dashboard card skeleton
const DashboardCardSkeleton: React.FC = () => (
  <Card sx={{ height: '100%', p: 2 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
      <Skeleton variant="text" width="40%" height={28} />
      <Skeleton variant="circular" width={24} height={24} />
    </Box>
    <Skeleton variant="text" width="70%" height={36} sx={{ mb: 2 }} />
    <Skeleton variant="rectangular" height={8} sx={{ borderRadius: 1, mb: 1 }} />
  </Card>
);

// Table skeleton
const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  const theme = useTheme();
  
  return (
    <Box sx={{ width: '100%' }}>
      {/* Header row */}
      <Box sx={{ 
        display: 'flex', 
        mb: 1, 
        pb: 1, 
        borderBottom: `2px solid ${theme.palette.divider}` 
      }}>
        {[20, 30, 25, 25].map((width, i) => (
          <Skeleton 
            key={i} 
            variant="text" 
            width={`${width}%`} 
            height={32} 
            sx={{ mr: i < 3 ? 2 : 0 }} 
          />
        ))}
      </Box>
      
      {/* Data rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <Box 
          key={rowIndex} 
          sx={{ 
            display: 'flex', 
            py: 1.5, 
            borderBottom: `1px solid ${theme.palette.divider}` 
          }}
        >
          {[20, 30, 25, 25].map((width, i) => (
            <Skeleton 
              key={i} 
              variant="text" 
              width={`${width - (Math.random() * 10)}%`} 
              height={20} 
              sx={{ mr: i < 3 ? 2 : 0 }} 
            />
          ))}
        </Box>
      ))}
    </Box>
  );
};

// List skeleton
const ListSkeleton: React.FC<{ items?: number }> = ({ items = 5 }) => (
  <Box sx={{ width: '100%' }}>
    {Array.from({ length: items }).map((_, i) => (
      <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
        <Box sx={{ width: '100%' }}>
          <Skeleton variant="text" width={`${70 - (Math.random() * 30)}%`} height={24} />
          <Skeleton variant="text" width={`${50 - (Math.random() * 20)}%`} height={16} />
        </Box>
      </Box>
    ))}
  </Box>
);

// Chart skeleton
const ChartSkeleton: React.FC = () => (
  <Box sx={{ width: '100%' }}>
    <Skeleton variant="text" width="40%" height={24} sx={{ mb: 2 }} />
    <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 1, mb: 2 }} />
    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
      <Skeleton variant="text" width="15%" height={16} />
      <Skeleton variant="text" width="15%" height={16} />
      <Skeleton variant="text" width="15%" height={16} />
      <Skeleton variant="text" width="15%" height={16} />
    </Box>
  </Box>
);

// Stats skeleton for dashboard
const StatsSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => (
  <Grid container spacing={3}>
    {Array.from({ length: count }).map((_, i) => (
      <Grid item xs={12} sm={6} md={3} key={i}>
        <DashboardCardSkeleton />
      </Grid>
    ))}
  </Grid>
);

// Profile skeleton
const ProfileSkeleton: React.FC = () => (
  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Skeleton variant="circular" width={120} height={120} sx={{ mb: 2 }} />
      <Skeleton variant="text" width={100} height={24} />
      <Skeleton variant="text" width={80} height={16} />
    </Box>
    <Box sx={{ flexGrow: 1 }}>
      <Skeleton variant="text" width="60%" height={32} sx={{ mb: 3 }} />
      <Grid container spacing={2}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Grid item xs={12} sm={6} key={i}>
            <Skeleton variant="text" width="40%" height={16} sx={{ mb: 1 }} />
            <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
          </Grid>
        ))}
      </Grid>
    </Box>
  </Box>
);

// Text skeleton
const TextSkeleton: React.FC<{ lines?: number }> = ({ lines = 3 }) => (
  <Box sx={{ width: '100%' }}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton 
        key={i} 
        variant="text" 
        width={i === lines - 1 ? '80%' : '100%'} 
        height={20} 
        sx={{ mb: 1 }} 
      />
    ))}
  </Box>
);

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  variant = 'text',
  count = 1,
  height,
  width,
  animation = 'pulse',
  className,
  style
}) => {
  // For simple skeleton types, just render multiple instances
  if (variant === 'text') {
    return (
      <Box className={className} style={style}>
        {Array.from({ length: count }).map((_, i) => (
          <AnimatedSkeleton 
            key={i} 
            variant="text" 
            height={height || 20} 
            width={width || '100%'} 
            animation={animation} 
            sx={{ mb: 1 }}
          />
        ))}
      </Box>
    );
  }

  // For complex skeleton types, use specialized components
  switch (variant) {
    case 'card':
      return (
        <Box className={className} style={style}>
          {Array.from({ length: count }).map((_, i) => (
            <Box key={i} sx={{ mb: 2 }}>
              <CardSkeleton />
            </Box>
          ))}
        </Box>
      );
      
    case 'dashboard-card':
      return (
        <Box className={className} style={style}>
          {Array.from({ length: count }).map((_, i) => (
            <Box key={i} sx={{ mb: 2 }}>
              <DashboardCardSkeleton />
            </Box>
          ))}
        </Box>
      );
      
    case 'table':
      return (
        <Box className={className} style={style}>
          <TableSkeleton rows={count} />
        </Box>
      );
      
    case 'list':
      return (
        <Box className={className} style={style}>
          <ListSkeleton items={count} />
        </Box>
      );
      
    case 'chart':
      return (
        <Box className={className} style={style}>
          {Array.from({ length: count }).map((_, i) => (
            <Box key={i} sx={{ mb: 3 }}>
              <ChartSkeleton />
            </Box>
          ))}
        </Box>
      );
      
    case 'stats':
      return (
        <Box className={className} style={style}>
          <StatsSkeleton count={count} />
        </Box>
      );
      
    case 'profile':
      return (
        <Box className={className} style={style}>
          <ProfileSkeleton />
        </Box>
      );
      
    default:
      return (
        <Box className={className} style={style}>
          {Array.from({ length: count }).map((_, i) => (
            <AnimatedSkeleton 
              key={i} 
              variant="rectangular" 
              height={height || 100} 
              width={width || '100%'} 
              animation={animation}
              sx={{ mb: 2, borderRadius: 1 }}
            />
          ))}
        </Box>
      );
  }
};

export default SkeletonLoader; 