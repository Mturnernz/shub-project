import { supabase } from '../../../lib/supabase';
import type { Database } from '../../../lib/supabase';

export type VerificationDoc = Database['public']['Tables']['verification_docs']['Row'];

export interface RiskFlag {
  type: 'document_quality' | 'age_verification' | 'identity_mismatch' | 'suspicious_activity' | 'duplicate_detection';
  severity: 'low' | 'medium' | 'high';
  details: string;
  auto_detected: boolean;
}

export interface VerificationResult {
  status: 'pending' | 'approved' | 'rejected' | 'requires_resubmission';
  risk_flags: RiskFlag[];
  confidence_score: number;
  reviewer_notes?: string;
  requires_manual_review: boolean;
  estimated_age?: number;
}

export interface DocumentAnalysis {
  quality_score: number;
  text_clarity: number;
  photo_authenticity: number;
  document_type: string;
  extracted_info: {
    name?: string;
    date_of_birth?: string;
    document_number?: string;
    expiry_date?: string;
  };
  risk_indicators: string[];
}

/**
 * Enhanced verification process with risk assessment
 */
export const processVerificationDocuments = async (
  userId: string,
  selfieUrl: string,
  idFrontUrl: string,
  role: 'worker' | 'client'
): Promise<{ success: boolean; verification?: VerificationResult; error?: string }> => {
  try {
    // Analyze documents for quality and authenticity
    const documentAnalysis = await analyzeDocuments(idFrontUrl, selfieUrl);

    // Perform risk assessment
    const riskAssessment = await assessVerificationRisk(userId, documentAnalysis, role);

    // Create verification record
    const { data, error } = await supabase
      .from('verification_docs')
      .insert({
        user_id: userId,
        role,
        selfie_url: selfieUrl,
        id_front_url: idFrontUrl,
        status: riskAssessment.requires_manual_review ? 'pending' : 'approved'
      })
      .select()
      .single();

    if (error) throw error;

    // Log verification attempt
    await supabase.from('admin_audit').insert({
      admin_id: 'system',
      action: 'verification_submitted',
      target_type: 'user',
      target_id: userId,
      details: {
        role,
        document_analysis: documentAnalysis,
        risk_assessment: riskAssessment,
        verification_id: data.id
      }
    });

    // Auto-approve low-risk verifications
    if (!riskAssessment.requires_manual_review && riskAssessment.risk_flags.length === 0) {
      await approveVerification(data.id, 'system', 'Auto-approved: Low risk profile');
    }

    return { success: true, verification: riskAssessment };
  } catch (error: any) {
    console.error('Error processing verification:', error);
    return { success: false, error: error.message || 'Failed to process verification' };
  }
};

/**
 * Analyze document quality and authenticity
 */
const analyzeDocuments = async (idUrl: string, selfieUrl: string): Promise<DocumentAnalysis> => {
  // In a real implementation, this would use ML services like:
  // - AWS Textract for text extraction
  // - Google Cloud Vision for document analysis
  // - Azure Cognitive Services for face comparison
  // - Custom ML models for forgery detection

  // Simulated analysis for demo purposes
  const mockAnalysis: DocumentAnalysis = {
    quality_score: Math.random() * 0.3 + 0.7, // 0.7-1.0
    text_clarity: Math.random() * 0.3 + 0.7,
    photo_authenticity: Math.random() * 0.3 + 0.7,
    document_type: 'drivers_license',
    extracted_info: {
      name: 'Sample Name',
      date_of_birth: '1990-01-01',
      document_number: 'DL123456789',
      expiry_date: '2025-12-31'
    },
    risk_indicators: []
  };

  // Add risk indicators based on quality scores
  if (mockAnalysis.quality_score < 0.8) {
    mockAnalysis.risk_indicators.push('low_image_quality');
  }
  if (mockAnalysis.text_clarity < 0.8) {
    mockAnalysis.risk_indicators.push('unclear_text');
  }
  if (mockAnalysis.photo_authenticity < 0.8) {
    mockAnalysis.risk_indicators.push('potential_tampering');
  }

  return mockAnalysis;
};

/**
 * Assess verification risk based on multiple factors
 */
const assessVerificationRisk = async (
  userId: string,
  documentAnalysis: DocumentAnalysis,
  role: 'worker' | 'client'
): Promise<VerificationResult> => {
  const riskFlags: RiskFlag[] = [];
  let confidenceScore = 1.0;

  // Document quality assessment
  if (documentAnalysis.quality_score < 0.7) {
    riskFlags.push({
      type: 'document_quality',
      severity: 'high',
      details: 'Document image quality is below acceptable threshold',
      auto_detected: true
    });
    confidenceScore -= 0.3;
  } else if (documentAnalysis.quality_score < 0.8) {
    riskFlags.push({
      type: 'document_quality',
      severity: 'medium',
      details: 'Document image quality is marginal',
      auto_detected: true
    });
    confidenceScore -= 0.1;
  }

  // Age verification
  if (documentAnalysis.extracted_info.date_of_birth) {
    const birthDate = new Date(documentAnalysis.extracted_info.date_of_birth);
    const age = Math.floor((Date.now() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25));

    if (age < 18) {
      riskFlags.push({
        type: 'age_verification',
        severity: 'high',
        details: 'User appears to be under 18 years old',
        auto_detected: true
      });
      confidenceScore = 0;
    } else if (age < 21) {
      riskFlags.push({
        type: 'age_verification',
        severity: 'medium',
        details: 'User is young adult - requires careful verification',
        auto_detected: true
      });
      confidenceScore -= 0.2;
    }
  }

  // Check for suspicious activity patterns
  const suspiciousActivity = await checkSuspiciousActivity(userId);
  if (suspiciousActivity.length > 0) {
    riskFlags.push({
      type: 'suspicious_activity',
      severity: 'high',
      details: `Suspicious patterns detected: ${suspiciousActivity.join(', ')}`,
      auto_detected: true
    });
    confidenceScore -= 0.4;
  }

  // Check for duplicate documents
  const duplicateCheck = await checkDuplicateDocuments(
    documentAnalysis.extracted_info.document_number || ''
  );
  if (duplicateCheck.found) {
    riskFlags.push({
      type: 'duplicate_detection',
      severity: 'high',
      details: `Document already used for verification by another user`,
      auto_detected: true
    });
    confidenceScore = 0;
  }

  // Risk thresholds for manual review
  const highRiskFlags = riskFlags.filter(f => f.severity === 'high');
  const requiresManualReview = highRiskFlags.length > 0 || confidenceScore < 0.7;

  let status: 'pending' | 'approved' | 'rejected' | 'requires_resubmission' = 'pending';

  if (!requiresManualReview && riskFlags.length === 0) {
    status = 'approved';
  } else if (confidenceScore === 0 || highRiskFlags.length >= 2) {
    status = 'rejected';
  } else if (confidenceScore < 0.5) {
    status = 'requires_resubmission';
  }

  return {
    status,
    risk_flags: riskFlags,
    confidence_score: Math.max(0, confidenceScore),
    requires_manual_review: requiresManualReview,
    estimated_age: documentAnalysis.extracted_info.date_of_birth
      ? Math.floor((Date.now() - new Date(documentAnalysis.extracted_info.date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
      : undefined
  };
};

/**
 * Check for suspicious activity patterns
 */
const checkSuspiciousActivity = async (userId: string): Promise<string[]> => {
  const suspiciousPatterns: string[] = [];

  try {
    // Check for multiple recent verification attempts
    const { count: recentAttempts } = await supabase
      .from('verification_docs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if ((recentAttempts || 0) > 3) {
      suspiciousPatterns.push('multiple_verification_attempts');
    }

    // Check for recent account creation
    const { data: user } = await supabase
      .from('users')
      .select('created_at')
      .eq('id', userId)
      .single();

    if (user) {
      const accountAge = Date.now() - new Date(user.created_at).getTime();
      const hoursOld = accountAge / (1000 * 60 * 60);

      if (hoursOld < 1) {
        suspiciousPatterns.push('very_new_account');
      }
    }

    // Check for rapid profile changes
    const { count: recentAudits } = await supabase
      .from('admin_audit')
      .select('*', { count: 'exact', head: true })
      .eq('target_id', userId)
      .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()); // Last hour

    if ((recentAudits || 0) > 5) {
      suspiciousPatterns.push('rapid_profile_changes');
    }

  } catch (error) {
    console.error('Error checking suspicious activity:', error);
  }

  return suspiciousPatterns;
};

/**
 * Check for duplicate document usage
 */
const checkDuplicateDocuments = async (documentNumber: string): Promise<{ found: boolean; userId?: string }> => {
  if (!documentNumber) return { found: false };

  try {
    // In a real implementation, this would check extracted document numbers
    // For now, we'll check if the same document has been used before
    const { data: existingDocs } = await supabase
      .from('admin_audit')
      .select('target_id, details')
      .eq('action', 'verification_submitted')
      .neq('target_id', '')
      .limit(100);

    const duplicateDoc = existingDocs?.find(doc => {
      const details = doc.details as any;
      return details?.document_analysis?.extracted_info?.document_number === documentNumber;
    });

    return {
      found: !!duplicateDoc,
      userId: duplicateDoc?.target_id
    };
  } catch (error) {
    console.error('Error checking duplicate documents:', error);
    return { found: false };
  }
};

/**
 * Approve verification
 */
export const approveVerification = async (
  verificationId: string,
  reviewerId: string,
  notes?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Update verification status
    const { data, error } = await supabase
      .from('verification_docs')
      .update({
        status: 'approved',
        reviewer_id: reviewerId,
        reviewed_at: new Date().toISOString(),
        notes
      })
      .eq('id', verificationId)
      .select()
      .single();

    if (error) throw error;

    // Update user verification status
    await supabase
      .from('users')
      .update({ is_verified: true })
      .eq('id', data.user_id);

    // Log approval
    await supabase.from('admin_audit').insert({
      admin_id: reviewerId,
      action: 'verification_approved',
      target_type: 'user',
      target_id: data.user_id,
      details: {
        verification_id: verificationId,
        notes,
        approved_at: new Date().toISOString()
      }
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error approving verification:', error);
    return { success: false, error: error.message || 'Failed to approve verification' };
  }
};

/**
 * Reject verification
 */
export const rejectVerification = async (
  verificationId: string,
  reviewerId: string,
  reason: string,
  allowResubmission: boolean = true
): Promise<{ success: boolean; error?: string }> => {
  try {
    const status = allowResubmission ? 'requires_resubmission' : 'rejected';

    const { data, error } = await supabase
      .from('verification_docs')
      .update({
        status,
        reviewer_id: reviewerId,
        reviewed_at: new Date().toISOString(),
        notes: reason
      })
      .eq('id', verificationId)
      .select()
      .single();

    if (error) throw error;

    // Log rejection
    await supabase.from('admin_audit').insert({
      admin_id: reviewerId,
      action: `verification_${status}`,
      target_type: 'user',
      target_id: data.user_id,
      details: {
        verification_id: verificationId,
        reason,
        allow_resubmission: allowResubmission,
        rejected_at: new Date().toISOString()
      }
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error rejecting verification:', error);
    return { success: false, error: error.message || 'Failed to reject verification' };
  }
};

/**
 * Get verification statistics
 */
export const getVerificationStats = async (timeframe: 'day' | 'week' | 'month' = 'week'): Promise<{
  total_submissions: number;
  pending_review: number;
  approved: number;
  rejected: number;
  approval_rate: number;
  average_review_time: number;
  risk_flag_distribution: Record<string, number>;
}> => {
  try {
    const now = new Date();
    const startDate = new Date();

    switch (timeframe) {
      case 'day':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
    }

    const { data: verifications, error } = await supabase
      .from('verification_docs')
      .select('status, created_at, reviewed_at')
      .gte('created_at', startDate.toISOString());

    if (error) throw error;

    const total = verifications?.length || 0;
    const pending = verifications?.filter(v => v.status === 'pending').length || 0;
    const approved = verifications?.filter(v => v.status === 'approved').length || 0;
    const rejected = verifications?.filter(v => v.status === 'rejected' || v.status === 'requires_resubmission').length || 0;

    const approvalRate = total > 0 ? (approved / (approved + rejected)) * 100 : 0;

    // Calculate average review time
    const reviewedVerifications = verifications?.filter(v => v.reviewed_at) || [];
    const totalReviewTime = reviewedVerifications.reduce((acc, v) => {
      const created = new Date(v.created_at).getTime();
      const reviewed = new Date(v.reviewed_at!).getTime();
      return acc + (reviewed - created);
    }, 0);

    const averageReviewTime = reviewedVerifications.length > 0
      ? totalReviewTime / reviewedVerifications.length / (1000 * 60 * 60) // Convert to hours
      : 0;

    return {
      total_submissions: total,
      pending_review: pending,
      approved,
      rejected,
      approval_rate: approvalRate,
      average_review_time: averageReviewTime,
      risk_flag_distribution: {} // Would need to aggregate from audit logs
    };
  } catch (error) {
    console.error('Error getting verification stats:', error);
    return {
      total_submissions: 0,
      pending_review: 0,
      approved: 0,
      rejected: 0,
      approval_rate: 0,
      average_review_time: 0,
      risk_flag_distribution: {}
    };
  }
};