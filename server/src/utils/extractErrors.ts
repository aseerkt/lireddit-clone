import { ValidationError } from 'class-validator';
import { FieldError } from '../types';

export const extractErrors = (errors: ValidationError[]) => {
  const fieldErrors: FieldError[] = [];

  errors.forEach(({ property, constraints }) => {
    fieldErrors.push({
      field: property,
      message: Object.values(constraints!)[0],
    });
  });

  return fieldErrors;
};
