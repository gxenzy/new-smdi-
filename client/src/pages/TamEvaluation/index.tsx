import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Rating,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  Save as SaveIcon,
  Assessment as AssessmentIcon,
  Send as SubmitIcon,
} from '@mui/icons-material';

interface EvaluationQuestion {
  id: string;
  category: string;
  question: string;
  type: 'rating' | 'radio' | 'text';
  options?: string[];
  value: any;
}

const TamEvaluation: React.FC = () => {
  const [questions, setQuestions] = useState<EvaluationQuestion[]>([
    // Perceived Usefulness
    {
      id: 'pu1',
      category: 'Perceived Usefulness',
      question: 'The energy audit tool helps me be more effective in my work',
      type: 'rating',
      value: 0,
    },
    {
      id: 'pu2',
      category: 'Perceived Usefulness',
      question: 'The tool provides valuable insights for energy management',
      type: 'rating',
      value: 0,
    },
    // Perceived Ease of Use
    {
      id: 'peou1',
      category: 'Perceived Ease of Use',
      question: 'The tool is easy to use and navigate',
      type: 'rating',
      value: 0,
    },
    {
      id: 'peou2',
      category: 'Perceived Ease of Use',
      question: 'Learning to use the tool was easy for me',
      type: 'rating',
      value: 0,
    },
    // Attitude Toward Using
    {
      id: 'att1',
      category: 'Attitude Toward Using',
      question: 'How satisfied are you with the tool overall?',
      type: 'radio',
      options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied'],
      value: '',
    },
    // Behavioral Intention to Use
    {
      id: 'bi1',
      category: 'Behavioral Intention to Use',
      question: 'I intend to continue using the tool in the future',
      type: 'rating',
      value: 0,
    },
    // Feedback
    {
      id: 'fb1',
      category: 'Feedback',
      question: 'What improvements would you suggest for the tool?',
      type: 'text',
      value: '',
    },
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleValueChange = (questionId: string, value: any) => {
    setQuestions(prev =>
      prev.map(q =>
        q.id === questionId ? { ...q, value } : q
      )
    );
  };

  const calculateProgress = () => {
    const answered = questions.filter(q => {
      if (q.type === 'rating') return q.value > 0;
      if (q.type === 'radio') return q.value !== '';
      if (q.type === 'text') return q.value.trim() !== '';
      return false;
    }).length;
    return (answered / questions.length) * 100;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setSubmitted(true);
    setSubmitting(false);
  };

  const renderQuestion = (question: EvaluationQuestion) => {
    switch (question.type) {
      case 'rating':
        return (
          <Rating
            value={question.value}
            onChange={(_, value) => handleValueChange(question.id, value)}
            size="large"
          />
        );
      case 'radio':
        return (
          <FormControl component="fieldset">
            <RadioGroup
              value={question.value}
              onChange={(e) => handleValueChange(question.id, e.target.value)}
            >
              {question.options?.map((option) => (
                <FormControlLabel
                  key={option}
                  value={option}
                  control={<Radio />}
                  label={option}
                />
              ))}
            </RadioGroup>
          </FormControl>
        );
      case 'text':
        return (
          <TextField
            fullWidth
            multiline
            rows={4}
            value={question.value}
            onChange={(e) => handleValueChange(question.id, e.target.value)}
            placeholder="Enter your feedback here..."
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">TAM Evaluation</Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<SubmitIcon />}
            onClick={handleSubmit}
            disabled={submitting || submitted || calculateProgress() < 100}
            sx={{ mr: 1 }}
          >
            {submitting ? 'Submitting...' : 'Submit Evaluation'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<SaveIcon />}
            disabled={submitting}
          >
            Save Draft
          </Button>
        </Box>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Completion Progress
        </Typography>
        <LinearProgress
          variant="determinate"
          value={calculateProgress()}
          sx={{ mb: 1 }}
        />
        <Typography variant="body2" color="textSecondary">
          {Math.round(calculateProgress())}% Complete
        </Typography>
      </Box>

      {submitted ? (
        <Card>
          <CardContent>
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <AssessmentIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Thank you for your evaluation!
              </Typography>
              <Typography color="textSecondary">
                Your feedback will help us improve the energy audit tool.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {questions.map((question, index) => (
            <Grid item xs={12} key={question.id}>
              <Card>
                <CardContent>
                  <Box sx={{ mb: 2 }}>
                    <Chip
                      label={question.category}
                      color="primary"
                      size="small"
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="h6" gutterBottom>
                      {index + 1}. {question.question}
                    </Typography>
                  </Box>
                  {renderQuestion(question)}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default TamEvaluation;
