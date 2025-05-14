import axios from 'axios';
import { ReportComment, CommentsApiResponse, CommentApiResponse } from '../types/reports';

// API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

/**
 * Service for managing report comments
 */
const commentService = {
  /**
   * Get all comments for a report
   * @param reportId Report ID
   * @returns Promise with comments array
   */
  getComments: async (reportId: number): Promise<ReportComment[]> => {
    try {
      const response = await axios.get<CommentsApiResponse>(
        `${API_URL}/reports/${reportId}/comments`
      );
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to get comments');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Error getting comments:', error);
      throw error;
    }
  },

  /**
   * Add a comment to a report
   * @param reportId Report ID
   * @param comment Comment data
   * @returns Promise with created comment
   */
  addComment: async (
    reportId: number,
    comment: {
      content: string;
      content_index?: number;
      parent_id?: number;
    }
  ): Promise<ReportComment> => {
    try {
      const response = await axios.post<CommentApiResponse>(
        `${API_URL}/reports/${reportId}/comments`,
        comment
      );
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to add comment');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  },

  /**
   * Update an existing comment
   * @param reportId Report ID
   * @param commentId Comment ID
   * @param updates Comment updates
   * @returns Promise with updated comment
   */
  updateComment: async (
    reportId: number,
    commentId: number,
    updates: {
      content?: string;
      is_resolved?: boolean;
    }
  ): Promise<ReportComment> => {
    try {
      const response = await axios.put<CommentApiResponse>(
        `${API_URL}/reports/${reportId}/comments/${commentId}`,
        updates
      );
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to update comment');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Error updating comment:', error);
      throw error;
    }
  },

  /**
   * Delete a comment
   * @param reportId Report ID
   * @param commentId Comment ID
   * @returns Promise with success status
   */
  deleteComment: async (reportId: number, commentId: number): Promise<boolean> => {
    try {
      const response = await axios.delete<CommentApiResponse>(
        `${API_URL}/reports/${reportId}/comments/${commentId}`
      );
      
      return response.data.success;
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  },

  /**
   * Reply to an existing comment
   * @param reportId Report ID
   * @param parentId Parent comment ID
   * @param content Reply content
   * @returns Promise with created reply
   */
  replyToComment: async (
    reportId: number,
    parentId: number,
    content: string
  ): Promise<ReportComment> => {
    return commentService.addComment(reportId, {
      content,
      parent_id: parentId
    });
  },

  /**
   * Mark a comment as resolved/unresolved
   * @param reportId Report ID
   * @param commentId Comment ID
   * @param isResolved Resolution status
   * @returns Promise with updated comment
   */
  resolveComment: async (
    reportId: number,
    commentId: number,
    isResolved: boolean
  ): Promise<ReportComment> => {
    return commentService.updateComment(reportId, commentId, {
      is_resolved: isResolved
    });
  }
};

export default commentService; 