import { supabase } from '../../../lib/supabase';

export interface ContentViolation {
  type: 'unsafe_practice' | 'minor_reference' | 'coercion' | 'illegal_service' | 'harassment' | 'spam' | 'external_contact';
  phrase: string;
  severity: number; // 1-10 scale
  context: string;
  auto_block: boolean;
}

export interface ContentModerationResult {
  safe: boolean;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  violations: ContentViolation[];
  filtered_content: string;
  requires_review: boolean;
  auto_block: boolean;
  confidence_score: number; // 0-1 scale
}

// Critical safety violations - immediate blocking
const CRITICAL_VIOLATIONS = [
  // Unsafe sexual practices
  { phrase: 'no condom', type: 'unsafe_practice' as const, severity: 10, auto_block: true },
  { phrase: 'without condom', type: 'unsafe_practice' as const, severity: 10, auto_block: true },
  { phrase: 'bareback', type: 'unsafe_practice' as const, severity: 10, auto_block: true },
  { phrase: 'bb', type: 'unsafe_practice' as const, severity: 9, auto_block: true },
  { phrase: 'raw', type: 'unsafe_practice' as const, severity: 9, auto_block: true },
  { phrase: 'unprotected', type: 'unsafe_practice' as const, severity: 10, auto_block: true },
  { phrase: 'skin to skin', type: 'unsafe_practice' as const, severity: 8, auto_block: true },
  { phrase: 'natural', type: 'unsafe_practice' as const, severity: 7, auto_block: false }, // Context dependent

  // Age-related concerns
  { phrase: 'young', type: 'minor_reference' as const, severity: 9, auto_block: true },
  { phrase: 'teen', type: 'minor_reference' as const, severity: 10, auto_block: true },
  { phrase: 'schoolgirl', type: 'minor_reference' as const, severity: 10, auto_block: true },
  { phrase: 'barely legal', type: 'minor_reference' as const, severity: 10, auto_block: true },
  { phrase: 'just turned 18', type: 'minor_reference' as const, severity: 8, auto_block: true },

  // Coercion and trafficking indicators
  { phrase: 'forced', type: 'coercion' as const, severity: 10, auto_block: true },
  { phrase: 'must', type: 'coercion' as const, severity: 6, auto_block: false },
  { phrase: 'no choice', type: 'coercion' as const, severity: 9, auto_block: true },
  { phrase: 'have to', type: 'coercion' as const, severity: 5, auto_block: false },
  { phrase: 'need money', type: 'coercion' as const, severity: 7, auto_block: false },

  // Illegal services
  { phrase: 'drugs', type: 'illegal_service' as const, severity: 10, auto_block: true },
  { phrase: 'cocaine', type: 'illegal_service' as const, severity: 10, auto_block: true },
  { phrase: 'meth', type: 'illegal_service' as const, severity: 10, auto_block: true },
  { phrase: 'party favors', type: 'illegal_service' as const, severity: 8, auto_block: true },
  { phrase: 'pills', type: 'illegal_service' as const, severity: 7, auto_block: false },

  // External contact attempts
  { phrase: 'whatsapp', type: 'external_contact' as const, severity: 6, auto_block: false },
  { phrase: 'telegram', type: 'external_contact' as const, severity: 6, auto_block: false },
  { phrase: 'my number', type: 'external_contact' as const, severity: 5, auto_block: false },
  { phrase: 'call me', type: 'external_contact' as const, severity: 5, auto_block: false },
  { phrase: 'cash only', type: 'external_contact' as const, severity: 7, auto_block: false },
];

// Medium risk phrases requiring review
const MEDIUM_RISK_VIOLATIONS = [
  { phrase: 'special service', type: 'unsafe_practice' as const, severity: 6, auto_block: false },
  { phrase: 'anything goes', type: 'unsafe_practice' as const, severity: 7, auto_block: false },
  { phrase: 'no limits', type: 'unsafe_practice' as const, severity: 8, auto_block: true },
  { phrase: 'extreme', type: 'unsafe_practice' as const, severity: 6, auto_block: false },
  { phrase: 'rough', type: 'harassment' as const, severity: 5, auto_block: false },
  { phrase: 'degrading', type: 'harassment' as const, severity: 8, auto_block: true },
  { phrase: 'submit', type: 'harassment' as const, severity: 6, auto_block: false },
];

// Harassment and abuse patterns
const HARASSMENT_PATTERNS = [
  { phrase: 'worthless', type: 'harassment' as const, severity: 9, auto_block: true },
  { phrase: 'slut', type: 'harassment' as const, severity: 7, auto_block: false }, // Context dependent
  { phrase: 'whore', type: 'harassment' as const, severity: 7, auto_block: false }, // Context dependent
  { phrase: 'bitch', type: 'harassment' as const, severity: 6, auto_block: false },
  { phrase: 'shut up', type: 'harassment' as const, severity: 7, auto_block: false },
  { phrase: 'kill yourself', type: 'harassment' as const, severity: 10, auto_block: true },
  { phrase: 'deserve to die', type: 'harassment' as const, severity: 10, auto_block: true },
];

// Spam and scam indicators
const SPAM_PATTERNS = [
  { phrase: 'click here', type: 'spam' as const, severity: 6, auto_block: false },
  { phrase: 'visit my website', type: 'spam' as const, severity: 7, auto_block: false },
  { phrase: 'free money', type: 'spam' as const, severity: 8, auto_block: true },
  { phrase: 'guaranteed', type: 'spam' as const, severity: 5, auto_block: false },
  { phrase: 'limited time', type: 'spam' as const, severity: 5, auto_block: false },
];

// Combine all violation patterns
const ALL_VIOLATIONS = [
  ...CRITICAL_VIOLATIONS,
  ...MEDIUM_RISK_VIOLATIONS,
  ...HARASSMENT_PATTERNS,
  ...SPAM_PATTERNS
];

/**
 * Advanced content moderation with risk assessment
 */
export const moderateContent = (content: string, context?: string): ContentModerationResult => {
  const violations: ContentViolation[] = [];
  let filteredContent = content;
  let totalSeverity = 0;
  let autoBlockCount = 0;

  // Normalize content for analysis
  const normalizedContent = content.toLowerCase().trim();

  // Check against all violation patterns
  ALL_VIOLATIONS.forEach(pattern => {
    const regex = new RegExp(`\\b${pattern.phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');

    if (regex.test(normalizedContent)) {
      const violation: ContentViolation = {
        type: pattern.type,
        phrase: pattern.phrase,
        severity: pattern.severity,
        context: context || 'general',
        auto_block: pattern.auto_block
      };

      violations.push(violation);
      totalSeverity += pattern.severity;

      if (pattern.auto_block) {
        autoBlockCount++;
      }

      // Filter the content
      filteredContent = filteredContent.replace(regex, '[FILTERED]');
    }
  });

  // Calculate risk level
  const avgSeverity = violations.length > 0 ? totalSeverity / violations.length : 0;
  let riskLevel: 'low' | 'medium' | 'high' | 'critical';

  if (autoBlockCount > 0 || avgSeverity >= 9) {
    riskLevel = 'critical';
  } else if (avgSeverity >= 7 || violations.length >= 3) {
    riskLevel = 'high';
  } else if (avgSeverity >= 5 || violations.length >= 2) {
    riskLevel = 'medium';
  } else {
    riskLevel = 'low';
  }

  // Determine if content should be auto-blocked
  const shouldAutoBlock = autoBlockCount > 0 || riskLevel === 'critical';

  // Determine if manual review is required
  const requiresReview = riskLevel === 'high' || (riskLevel === 'medium' && violations.length >= 2);

  // Calculate confidence score
  const confidenceScore = Math.min(1, violations.length * 0.3 + avgSeverity * 0.1);

  return {
    safe: violations.length === 0,
    risk_level: riskLevel,
    violations,
    filtered_content: filteredContent,
    requires_review: requiresReview,
    auto_block: shouldAutoBlock,
    confidence_score: confidenceScore
  };
};

/**
 * Enhanced content filtering for messages (replaces basic filter)
 */
export const filterMessageContent = (content: string): {
  safe: boolean;
  filtered_content: string;
  violations: string[];
  requires_review: boolean;
} => {
  const result = moderateContent(content, 'message');

  return {
    safe: result.safe,
    filtered_content: result.filtered_content,
    violations: result.violations.map(v => v.phrase),
    requires_review: result.requires_review
  };
};

/**
 * Profile content moderation
 */
export const moderateProfileContent = (
  bio: string,
  services: string[],
  rateText?: string
): ContentModerationResult => {
  const fullContent = [bio, ...services, rateText].filter(Boolean).join(' ');
  return moderateContent(fullContent, 'profile');
};

/**
 * Log moderation action for audit trail
 */
export const logModerationAction = async (
  contentType: 'message' | 'profile' | 'booking',
  contentId: string,
  result: ContentModerationResult,
  userId?: string
): Promise<void> => {
  try {
    await supabase.from('admin_audit').insert({
      admin_id: 'system',
      action: 'content_moderation',
      target_type: contentType,
      target_id: contentId,
      details: {
        risk_level: result.risk_level,
        violations: result.violations,
        auto_blocked: result.auto_block,
        requires_review: result.requires_review,
        user_id: userId
      }
    });
  } catch (error) {
    console.error('Failed to log moderation action:', error);
  }
};

/**
 * Check if user has pattern of violations
 */
export const checkUserViolationPattern = async (userId: string): Promise<{
  violationCount: number;
  recentViolations: number;
  riskLevel: 'low' | 'medium' | 'high';
  recommendAction: 'none' | 'warning' | 'temporary_restriction' | 'review_required';
}> => {
  try {
    // Get user's moderation history from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: violations, error } = await supabase
      .from('admin_audit')
      .select('details')
      .eq('action', 'content_moderation')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .contains('details', { user_id: userId });

    if (error) throw error;

    const violationCount = violations?.length || 0;
    const recentViolations = violations?.filter(v =>
      v.details?.risk_level === 'high' || v.details?.risk_level === 'critical'
    ).length || 0;

    let riskLevel: 'low' | 'medium' | 'high';
    let recommendAction: 'none' | 'warning' | 'temporary_restriction' | 'review_required';

    if (recentViolations >= 3 || violationCount >= 10) {
      riskLevel = 'high';
      recommendAction = 'review_required';
    } else if (recentViolations >= 2 || violationCount >= 5) {
      riskLevel = 'medium';
      recommendAction = 'temporary_restriction';
    } else if (violationCount >= 2) {
      riskLevel = 'low';
      recommendAction = 'warning';
    } else {
      riskLevel = 'low';
      recommendAction = 'none';
    }

    return {
      violationCount,
      recentViolations,
      riskLevel,
      recommendAction
    };
  } catch (error) {
    console.error('Error checking user violation pattern:', error);
    return {
      violationCount: 0,
      recentViolations: 0,
      riskLevel: 'low',
      recommendAction: 'none'
    };
  }
};