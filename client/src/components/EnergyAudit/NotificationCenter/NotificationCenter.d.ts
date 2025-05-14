import { NavigateFunction } from 'react-router-dom';

export interface NotificationCenterProps {
  onNavigate: NavigateFunction;
}

declare const NotificationCenter: React.FC<NotificationCenterProps>;

export default NotificationCenter; 