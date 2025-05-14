import React from 'react';
import {
  Accordion as MuiAccordion,
  AccordionSummary as MuiAccordionSummary,
  AccordionDetails as MuiAccordionDetails,
  Typography,
  useTheme,
  styled
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// Styled components for custom appearance
const StyledAccordion = styled(MuiAccordion)(({ theme }) => ({
  margin: theme.spacing(1, 0),
  borderRadius: theme.shape.borderRadius,
  '&:before': {
    display: 'none',
  },
  boxShadow: theme.shadows[1],
}));

const StyledAccordionSummary = styled(MuiAccordionSummary)(({ theme }) => ({
  borderRadius: `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0 0`,
  '&.Mui-expanded': {
    minHeight: 48,
  },
}));

const StyledAccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`,
}));

interface AccordionProps {
  title: React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  disabled?: boolean;
  onChange?: (event: React.SyntheticEvent, expanded: boolean) => void;
  id?: string;
  className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
  title,
  children,
  defaultExpanded = false,
  disabled = false,
  onChange,
  id,
  className,
}) => {
  const theme = useTheme();
  
  return (
    <StyledAccordion 
      defaultExpanded={defaultExpanded}
      disabled={disabled}
      onChange={onChange}
      id={id}
      className={className}
    >
      <StyledAccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls={id ? `${id}-content` : undefined}
        id={id ? `${id}-header` : undefined}
      >
        {typeof title === 'string' ? (
          <Typography variant="subtitle1" fontWeight="medium">
            {title}
          </Typography>
        ) : (
          title
        )}
      </StyledAccordionSummary>
      <StyledAccordionDetails>
        {children}
      </StyledAccordionDetails>
    </StyledAccordion>
  );
};

export const AccordionSummary = StyledAccordionSummary;
export const AccordionDetails = StyledAccordionDetails;

// Also export the original MUI components
export { 
  MuiAccordion,
  MuiAccordionSummary,
  MuiAccordionDetails
}; 