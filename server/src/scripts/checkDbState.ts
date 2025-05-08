import { pool } from '../config/database';
import { RowDataPacket } from 'mysql2';

(async () => {
  // Wipe all sample/demo data
  await pool.query('DELETE FROM audit_logs');
  await pool.query('DELETE FROM notifications');
  await pool.query('DELETE FROM comments');
  await pool.query('DELETE FROM attachments');
  await pool.query('DELETE FROM user_activity');
  await pool.query('DELETE FROM findings');
  await pool.query('DELETE FROM energy_audits');
  await pool.query("DELETE FROM users WHERE username != 'admin'");

  // Check state
  const [users] = await pool.query<RowDataPacket[]>('SELECT id, username, role FROM users');
  const [audits] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) as count FROM energy_audits');
  const [findings] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) as count FROM findings');
  const [activity] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) as count FROM user_activity');
  console.log('Users:', users);
  console.log('Energy Audits:', audits[0].count);
  console.log('Findings:', findings[0].count);
  console.log('User Activity:', activity[0].count);
  process.exit(0);
})(); 