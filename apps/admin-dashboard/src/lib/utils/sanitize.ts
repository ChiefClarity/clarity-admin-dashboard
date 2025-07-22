import DOMPurify from 'isomorphic-dompurify';
import { z } from 'zod';

export const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
};

export const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target'],
  });
};

// SQL injection prevention
export const sanitizeSqlInput = (input: string): string => {
  return input.replace(/['"`;\\]/g, '');
};

// Common validation schemas
export const EmailSchema = z.string().email().transform(sanitizeInput);
export const PhoneSchema = z.string().regex(/^\+?[\d\s-()]+$/).transform(sanitizeInput);
export const ZipCodeSchema = z.string().regex(/^\d{5}(-\d{4})?$/).transform(sanitizeInput);
export const UUIDSchema = z.string().uuid();