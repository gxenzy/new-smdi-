import { useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { useSnackbar } from 'notistack';

const NotificationListener = () => {
  const socket = useSocket();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    socket.on('notification', (notif) => {
      enqueueSnackbar(notif.message, { variant: notif.type || 'info' });
    });
    return () => {
      socket.off('notification');
    };
  }, [socket, enqueueSnackbar]);

  return null;
};

export default NotificationListener; 