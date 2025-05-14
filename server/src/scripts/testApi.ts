import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import FormData from 'form-data';
import * as readline from 'readline';

const API_URL = 'http://localhost:8000/api';

// Create a readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Promise-based question function
function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer);
    });
  });
}

interface LoginResponse {
  token: string;
}

interface Finding {
  id: number;
  title: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High';
  status: 'Open' | 'In Progress' | 'Closed';
  created_at: string;
  created_by_username?: string;
  assigned_to_username?: string;
}

interface FindingsResponse {
  findings: Finding[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface CreateFindingResponse {
  message: string;
  findingId: number;
}

interface Comment {
  id: number;
  finding_id: number;
  user_id: number;
  content: string;
  created_at: string;
  username: string;
  first_name: string;
  last_name: string;
}

interface Notification {
  id: number;
  user_id: number;
  finding_id: number;
  type: 'ASSIGNED' | 'UPDATED' | 'COMMENTED' | 'CLOSED';
  message: string;
  is_read: boolean;
  created_at: string;
  finding_title: string;
  finding_severity: string;
  finding_status: string;
}

interface NotificationsResponse {
  notifications: Notification[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

async function testLogin(username?: string, password?: string) {
  try {
    console.log('Testing login endpoint...');
    
    // If credentials are not provided, ask for them
    if (!username) {
      username = await question('Enter username: ');
    }
    
    if (!password) {
      password = await question('Enter password: ');
    }
    
    const response = await axios.post<LoginResponse>(`${API_URL}/auth/login`, {
      username,
      password
    });

    console.log('Login successful!');
    console.log('Token:', response.data.token);
    return response.data.token;
  } catch (error: any) {
    console.error('Login failed:', error.response?.data?.message || error.message);
    return null;
  }
}

async function testGetFindings(token: string) {
  try {
    console.log('\nTesting get findings endpoint (default parameters)...');
    const response = await axios.get<FindingsResponse>(`${API_URL}/findings`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log('Findings retrieved successfully!');
    console.log('Total findings:', response.data.pagination.total);
    console.log('First page findings:', response.data.findings);
    return response.data.findings;
  } catch (error: any) {
    console.error('Get findings failed:', error.response?.data?.message || error.message);
    return null;
  }
}

async function testFilteredFindings(token: string) {
  try {
    console.log('\nTesting filtered findings...');
    
    // Test severity filter
    console.log('\nTesting severity filter (High)...');
    const highSeverity = await axios.get<FindingsResponse>(`${API_URL}/findings?severity=High`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('High severity findings:', highSeverity.data.findings.length);

    // Test status filter
    console.log('\nTesting status filter (Open)...');
    const openStatus = await axios.get<FindingsResponse>(`${API_URL}/findings?status=Open`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Open findings:', openStatus.data.findings.length);

    // Test search
    console.log('\nTesting search (Energy)...');
    const searchResults = await axios.get<FindingsResponse>(`${API_URL}/findings?search=Energy`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Search results:', searchResults.data.findings.length);

    // Test sorting
    console.log('\nTesting sorting (by severity asc)...');
    const sorted = await axios.get<FindingsResponse>(
      `${API_URL}/findings?sortBy=severity&sortOrder=asc`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('Sorted findings:', sorted.data.findings.map((f: Finding) => f.severity));

    // Test pagination
    console.log('\nTesting pagination (page 1, limit 2)...');
    const paginated = await axios.get<FindingsResponse>(`${API_URL}/findings?page=1&limit=2`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Paginated results:', {
      findings: paginated.data.findings.length,
      pagination: paginated.data.pagination
    });

    return true;
  } catch (error: any) {
    console.error('Filtered findings test failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testCreateFinding(token: string) {
  try {
    console.log('\nTesting create finding endpoint...');
    const response = await axios.post<CreateFindingResponse>(
      `${API_URL}/findings`,
      {
        title: 'Test Finding',
        description: 'This is a test finding',
        severity: 'Medium',
        status: 'Open'
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    console.log('Finding created successfully!');
    console.log('Response:', response.data);
    return response.data.findingId;
  } catch (error: any) {
    console.error('Create finding failed:', error.response?.data?.message || error.message);
    return null;
  }
}

async function testUpdateFinding(token: string, findingId: number) {
  try {
    console.log('\nTesting update finding endpoint...');
    const response = await axios.put(
      `${API_URL}/findings/${findingId}`,
      {
        title: 'Updated Test Finding',
        description: 'This is an updated test finding',
        severity: 'High',
        status: 'In Progress'
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    console.log('Finding updated successfully!');
    console.log('Response:', response.data);
  } catch (error: any) {
    console.error('Update finding failed:', error.response?.data?.message || error.message);
  }
}

async function testAssignFinding(token: string, findingId: number) {
  try {
    console.log('\nTesting assign finding endpoint...');
    const response = await axios.post(
      `${API_URL}/findings/${findingId}/assign`,
      {
        assignedTo: 1 // Assign to admin user
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    console.log('Finding assigned successfully!');
    console.log('Response:', response.data);
  } catch (error: any) {
    console.error('Assign finding failed:', error.response?.data?.message || error.message);
  }
}

async function testUploadAttachment(token: string, findingId: number) {
  try {
    console.log('\nTesting upload attachment endpoint...');
    
    // Create a test file
    const testFilePath = path.join(__dirname, 'test.txt');
    fs.writeFileSync(testFilePath, 'This is a test file');

    // Create form data
    const formData = new FormData();
    const fileStream = fs.createReadStream(testFilePath);
    formData.append('file', fileStream);

    console.log('Sending file upload request...');
    const response = await axios.post<{ attachmentId: number }>(
      `${API_URL}/attachments/${findingId}`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${token}`
        }
      }
    );

    console.log('Attachment uploaded successfully!');
    console.log('Response:', response.data);

    // Clean up test file
    fs.unlinkSync(testFilePath);

    return response.data.attachmentId;
  } catch (error: any) {
    console.error('Upload attachment failed:', error.response?.data?.message || error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    }
    return null;
  }
}

async function testDownloadAttachment(token: string, attachmentId: number) {
  try {
    console.log('\nTesting download attachment endpoint...');
    const response = await axios.get(
      `${API_URL}/attachments/${attachmentId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
        responseType: 'stream'
      }
    );

    console.log('Attachment downloaded successfully!');
    console.log('Content-Type:', response.headers['content-type']);
    console.log('Content-Disposition:', response.headers['content-disposition']);

    return true;
  } catch (error: any) {
    console.error('Download attachment failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testDeleteAttachment(token: string, attachmentId: number) {
  try {
    console.log('\nTesting delete attachment endpoint...');
    const response = await axios.delete(
      `${API_URL}/attachments/${attachmentId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    console.log('Attachment deleted successfully!');
    console.log('Response:', response.data);
  } catch (error: any) {
    console.error('Delete attachment failed:', error.response?.data?.message || error.message);
  }
}

async function testCreateComment(token: string, findingId: number) {
  try {
    console.log('\nTesting create comment endpoint...');
    const response = await axios.post<Comment>(
      `${API_URL}/comments/${findingId}`,
      {
        content: 'This is a test comment'
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    console.log('Comment created successfully!');
    console.log('Response:', response.data);
    return response.data.id;
  } catch (error: any) {
    console.error('Create comment failed:', error.response?.data?.message || error.message);
    return null;
  }
}

async function testUpdateComment(token: string, commentId: number) {
  try {
    console.log('\nTesting update comment endpoint...');
    const response = await axios.put(
      `${API_URL}/comments/${commentId}`,
      {
        content: 'This is an updated test comment'
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    console.log('Comment updated successfully!');
    console.log('Response:', response.data);
  } catch (error: any) {
    console.error('Update comment failed:', error.response?.data?.message || error.message);
  }
}

async function testDeleteComment(token: string, commentId: number) {
  try {
    console.log('\nTesting delete comment endpoint...');
    const response = await axios.delete(
      `${API_URL}/comments/${commentId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    console.log('Comment deleted successfully!');
    console.log('Response:', response.data);
  } catch (error: any) {
    console.error('Delete comment failed:', error.response?.data?.message || error.message);
  }
}

async function testGetNotifications(token: string) {
  try {
    console.log('\nTesting get notifications endpoint...');
    const response = await axios.get<NotificationsResponse>(
      `${API_URL}/notifications`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    console.log('Notifications retrieved successfully!');
    console.log('Total notifications:', response.data.pagination.total);
    console.log('Notifications:', response.data.notifications);

    if (response.data.notifications.length > 0) {
      const notificationId = response.data.notifications[0].id;
      await testMarkNotificationAsRead(token, notificationId);
    }

    return true;
  } catch (error: any) {
    console.error('Get notifications failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testMarkNotificationAsRead(token: string, notificationId: number) {
  try {
    console.log('\nTesting mark notification as read endpoint...');
    const response = await axios.put(
      `${API_URL}/notifications/${notificationId}/read`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    console.log('Notification marked as read successfully!');
    console.log('Response:', response.data);
  } catch (error: any) {
    console.error('Mark notification as read failed:', error.response?.data?.message || error.message);
  }
}

async function testMarkAllNotificationsAsRead(token: string) {
  try {
    console.log('\nTesting mark all notifications as read endpoint...');
    const response = await axios.put(
      `${API_URL}/notifications/read-all`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    console.log('All notifications marked as read successfully!');
    console.log('Response:', response.data);
  } catch (error: any) {
    console.error('Mark all notifications as read failed:', error.response?.data?.message || error.message);
  }
}

async function testDeleteFinding(token: string, findingId: number) {
  try {
    console.log('\nTesting delete finding endpoint...');
    const response = await axios.delete(`${API_URL}/findings/${findingId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log('Finding deleted successfully!');
    console.log('Response:', response.data);
  } catch (error: any) {
    console.error('Delete finding failed:', error.response?.data?.message || error.message);
  }
}

async function runTests() {
  try {
    console.log('Starting API tests...');
    
    // Get login credentials from user
    const username = await question('Enter username for testing: ');
    const password = await question('Enter password for testing: ');
    
    const token = await testLogin(username, password);
    if (!token) {
      console.error('Login failed, aborting tests');
      process.exit(1);
      return;
    }
    
    await testGetFindings(token);
    await testFilteredFindings(token);
    const findingId = await testCreateFinding(token);
    if (findingId) {
      await testUpdateFinding(token, findingId);
      await testAssignFinding(token, findingId);

      // Test attachments
      const attachmentId = await testUploadAttachment(token, findingId);
      if (attachmentId) {
        await testDownloadAttachment(token, attachmentId);
        await testDeleteAttachment(token, attachmentId);
      }

      // Test comments
      const commentId = await testCreateComment(token, findingId);
      if (commentId) {
        await testUpdateComment(token, commentId);
        await testDeleteComment(token, commentId);
      }

      // Test notifications
      await testGetNotifications(token);
      await testMarkAllNotificationsAsRead(token);

      await testDeleteFinding(token, findingId);
    }
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    rl.close();
  }
}

runTests(); 