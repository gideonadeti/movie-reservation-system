import { Transform } from 'class-transformer';

/**
 * Trims whitespace from a string field.
 */
export const Trim = () =>
  Transform(({ value }: { value: string }) => value.trim());
