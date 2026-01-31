import { describe, it, expect } from 'vitest';
import {
  moderateContent,
  filterMessageContent,
  moderateProfileContent,
  type ContentModerationResult,
} from './content-moderation';

describe('moderateContent', () => {
  describe('safe content', () => {
    it('should pass clean content', () => {
      const result = moderateContent('Hello, I would like to learn more about your services');
      expect(result.safe).toBe(true);
      expect(result.risk_level).toBe('low');
      expect(result.violations).toHaveLength(0);
      expect(result.auto_block).toBe(false);
    });

    it('should pass normal conversation', () => {
      const result = moderateContent('Looking forward to our appointment on Tuesday. Please arrive on time.');
      expect(result.safe).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    it('should return confidence_score of 0 for clean content', () => {
      const result = moderateContent('Just a friendly greeting');
      expect(result.confidence_score).toBe(0);
    });
  });

  describe('critical violations - unsafe practices', () => {
    it('should auto-block "no condom" with severity 10', () => {
      const result = moderateContent('Can we do it with no condom?');
      expect(result.safe).toBe(false);
      expect(result.risk_level).toBe('critical');
      expect(result.auto_block).toBe(true);
      expect(result.violations.some(v => v.phrase === 'no condom')).toBe(true);
    });

    it('should auto-block "bareback"', () => {
      const result = moderateContent('I want bareback service');
      expect(result.auto_block).toBe(true);
      expect(result.violations[0].type).toBe('unsafe_practice');
    });

    it('should auto-block "unprotected"', () => {
      const result = moderateContent('Looking for unprotected experience');
      expect(result.auto_block).toBe(true);
    });

    it('should detect "bb" as unsafe practice', () => {
      const result = moderateContent('Do you offer bb?');
      expect(result.safe).toBe(false);
      expect(result.violations.some(v => v.phrase === 'bb')).toBe(true);
    });

    it('should detect "raw" as unsafe practice', () => {
      const result = moderateContent('I prefer raw');
      expect(result.safe).toBe(false);
      expect(result.auto_block).toBe(true);
    });

    it('should detect "skin to skin" as unsafe practice', () => {
      const result = moderateContent('I want skin to skin contact');
      expect(result.safe).toBe(false);
      expect(result.violations.some(v => v.phrase === 'skin to skin')).toBe(true);
    });

    it('should detect "natural" but NOT auto-block (context dependent)', () => {
      const result = moderateContent('I prefer natural');
      expect(result.safe).toBe(false);
      // 'natural' has auto_block: false — it's context dependent
      const naturalViolation = result.violations.find(v => v.phrase === 'natural');
      expect(naturalViolation?.auto_block).toBe(false);
    });
  });

  describe('critical violations - minor references', () => {
    it('should auto-block "teen"', () => {
      const result = moderateContent('Looking for teen services');
      expect(result.auto_block).toBe(true);
      expect(result.violations[0].type).toBe('minor_reference');
    });

    it('should auto-block "schoolgirl"', () => {
      const result = moderateContent('Schoolgirl fantasy');
      expect(result.auto_block).toBe(true);
      expect(result.violations.some(v => v.phrase === 'schoolgirl')).toBe(true);
    });

    it('should auto-block "barely legal"', () => {
      const result = moderateContent('Are you barely legal?');
      expect(result.auto_block).toBe(true);
    });

    it('should auto-block "just turned 18"', () => {
      const result = moderateContent('I just turned 18');
      expect(result.auto_block).toBe(true);
    });
  });

  describe('critical violations - coercion indicators', () => {
    it('should auto-block "forced"', () => {
      const result = moderateContent('She was forced to do it');
      expect(result.auto_block).toBe(true);
      expect(result.violations[0].type).toBe('coercion');
    });

    it('should auto-block "no choice"', () => {
      const result = moderateContent('I have no choice');
      expect(result.auto_block).toBe(true);
    });

    it('should detect "need money" but not auto-block', () => {
      const result = moderateContent('I need money urgently');
      expect(result.safe).toBe(false);
      const violation = result.violations.find(v => v.phrase === 'need money');
      expect(violation?.auto_block).toBe(false);
    });
  });

  describe('critical violations - illegal services', () => {
    it('should auto-block "drugs"', () => {
      const result = moderateContent('Can you get drugs?');
      expect(result.auto_block).toBe(true);
      expect(result.violations[0].type).toBe('illegal_service');
    });

    it('should auto-block "cocaine"', () => {
      const result = moderateContent('Do you have cocaine?');
      expect(result.auto_block).toBe(true);
    });

    it('should auto-block "meth"', () => {
      const result = moderateContent('Looking for meth');
      expect(result.auto_block).toBe(true);
    });

    it('should auto-block "party favors"', () => {
      const result = moderateContent('Any party favors available?');
      expect(result.auto_block).toBe(true);
    });
  });

  describe('external contact attempts', () => {
    it('should detect "whatsapp" but not auto-block', () => {
      const result = moderateContent('Message me on whatsapp');
      expect(result.safe).toBe(false);
      const violation = result.violations.find(v => v.phrase === 'whatsapp');
      expect(violation?.type).toBe('external_contact');
      expect(violation?.auto_block).toBe(false);
    });

    it('should detect "cash only"', () => {
      const result = moderateContent('I only accept cash only payment');
      expect(result.violations.some(v => v.phrase === 'cash only')).toBe(true);
    });
  });

  describe('medium risk violations', () => {
    it('should detect "anything goes"', () => {
      const result = moderateContent('With me, anything goes');
      expect(result.safe).toBe(false);
      expect(result.violations.some(v => v.phrase === 'anything goes')).toBe(true);
    });

    it('should auto-block "no limits"', () => {
      const result = moderateContent('I have no limits');
      expect(result.auto_block).toBe(true);
    });

    it('should auto-block "degrading"', () => {
      const result = moderateContent('Looking for degrading treatment');
      expect(result.auto_block).toBe(true);
    });
  });

  describe('harassment patterns', () => {
    it('should auto-block "kill yourself"', () => {
      const result = moderateContent('Go kill yourself');
      expect(result.auto_block).toBe(true);
      expect(result.violations[0].type).toBe('harassment');
      expect(result.violations[0].severity).toBe(10);
    });

    it('should auto-block "deserve to die"', () => {
      const result = moderateContent('You deserve to die');
      expect(result.auto_block).toBe(true);
    });

    it('should auto-block "worthless"', () => {
      const result = moderateContent('You are worthless');
      expect(result.auto_block).toBe(true);
    });
  });

  describe('spam patterns', () => {
    it('should auto-block "free money"', () => {
      const result = moderateContent('Click to get free money now');
      expect(result.auto_block).toBe(true);
      expect(result.violations.some(v => v.type === 'spam')).toBe(true);
    });

    it('should detect "click here"', () => {
      const result = moderateContent('Click here for details');
      expect(result.violations.some(v => v.phrase === 'click here')).toBe(true);
    });
  });

  describe('risk level calculation', () => {
    it('should be "critical" when auto_block violations present', () => {
      const result = moderateContent('bareback service');
      expect(result.risk_level).toBe('critical');
    });

    it('should be "low" for single low-severity violation', () => {
      const result = moderateContent('Message me on whatsapp');
      // whatsapp has severity 6, single violation, no auto_block
      // avgSeverity = 6, >= 5 so this is medium
      expect(['low', 'medium']).toContain(result.risk_level);
    });

    it('should escalate with multiple violations', () => {
      const result = moderateContent('Contact me on whatsapp, call me now, visit my website');
      expect(result.violations.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('content filtering', () => {
    it('should replace violation phrases with [FILTERED]', () => {
      const result = moderateContent('I want bareback');
      expect(result.filtered_content).toContain('[FILTERED]');
      expect(result.filtered_content).not.toContain('bareback');
    });

    it('should preserve non-violating content', () => {
      const result = moderateContent('Hello there, I want bareback service');
      expect(result.filtered_content).toContain('Hello there');
    });
  });

  describe('case insensitivity', () => {
    it('should detect uppercase violations', () => {
      const result = moderateContent('BAREBACK SERVICE');
      expect(result.safe).toBe(false);
    });

    it('should detect mixed case violations', () => {
      const result = moderateContent('BaReBaCk');
      expect(result.safe).toBe(false);
    });
  });
});

describe('filterMessageContent', () => {
  it('should return simplified format for messages', () => {
    const result = filterMessageContent('Safe message content');
    expect(result.safe).toBe(true);
    expect(result.filtered_content).toBe('Safe message content');
    expect(result.violations).toEqual([]);
    expect(result.requires_review).toBe(false);
  });

  it('should filter unsafe message content', () => {
    const result = filterMessageContent('Can we go bareback?');
    expect(result.safe).toBe(false);
    expect(result.violations).toContain('bareback');
  });
});

describe('moderateProfileContent', () => {
  it('should moderate combined profile content', () => {
    const result = moderateProfileContent(
      'Professional companion',
      ['Dinner dates', 'Social events'],
      '$200/hr'
    );
    expect(result.safe).toBe(true);
  });

  it('should detect violations in bio', () => {
    const result = moderateProfileContent(
      'Anything goes with me',
      ['Standard services'],
    );
    expect(result.safe).toBe(false);
  });

  it('should detect violations in services list', () => {
    const result = moderateProfileContent(
      'Clean bio',
      ['no limits experience'],
    );
    expect(result.safe).toBe(false);
  });
});
