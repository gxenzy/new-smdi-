import { useTheme as useMuiTheme } from '@mui/material/styles';
import { alpha } from '@mui/material';

export interface ActivityStyles {
  card: Record<string, unknown>;
  statusChip: {
    completed: Record<string, unknown>;
    inProgress: Record<string, unknown>;
    pending: Record<string, unknown>;
  };
  timeline: Record<string, unknown>;
  chartStyles: {
    grid: Record<string, unknown>;
    text: Record<string, unknown>;
    tooltip: Record<string, unknown>;
    area: Record<string, unknown>;
    line: Record<string, unknown>;
  };
}

export const useActivityStyles = (): ActivityStyles => {
  const theme = useMuiTheme();
  const isDark = theme.palette.mode === 'dark';

  return {
    card: {
      backgroundColor: isDark 
        ? alpha(theme.palette.primary.main, 0.05)
        : theme.palette.background.paper,
      borderRadius: theme.shape.borderRadius,
      transition: 'all 0.3s ease-in-out',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: isDark
          ? `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`
          : theme.shadows[4],
      },
    },
    statusChip: {
      completed: {
        backgroundColor: alpha(theme.palette.success.main, isDark ? 0.15 : 0.1),
        color: theme.palette.success.main,
        '& .MuiChip-icon': {
          color: theme.palette.success.main,
        },
      },
      inProgress: {
        backgroundColor: alpha(theme.palette.info.main, isDark ? 0.15 : 0.1),
        color: theme.palette.info.main,
        '& .MuiChip-icon': {
          color: theme.palette.info.main,
        },
      },
      pending: {
        backgroundColor: alpha(theme.palette.warning.main, isDark ? 0.15 : 0.1),
        color: theme.palette.warning.main,
        '& .MuiChip-icon': {
          color: theme.palette.warning.main,
        },
      },
    },
    timeline: {
      '& .MuiTimelineItem-root:before': {
        flex: 0,
        padding: 0,
      },
      '& .MuiTimelineDot-root': {
        margin: 0,
        borderWidth: 2,
      },
      '& .MuiTimelineConnector-root': {
        backgroundColor: isDark 
          ? alpha(theme.palette.primary.main, 0.2)
          : theme.palette.divider,
      },
    },
    chartStyles: {
      grid: {
        stroke: isDark 
          ? alpha(theme.palette.common.white, 0.1)
          : theme.palette.divider,
      },
      text: {
        fill: theme.palette.text.primary,
      },
      tooltip: {
        backgroundColor: isDark
          ? alpha(theme.palette.background.paper, 0.95)
          : theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: theme.shadows[3],
        '& .recharts-tooltip-label': {
          color: theme.palette.text.primary,
        },
      },
      area: {
        fill: isDark
          ? `url(#colorGradient-${theme.palette.primary.main})`
          : theme.palette.primary.main,
        fillOpacity: 0.1,
      },
      line: {
        stroke: theme.palette.primary.main,
        strokeWidth: 2,
      },
    },
  };
}; 