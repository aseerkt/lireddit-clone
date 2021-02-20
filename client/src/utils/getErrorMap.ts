import { FieldError } from '../generated/graphql';

export const getErrorMap = (errors: FieldError[]) => {
  let fieldErrors: Record<string, string> = {};
  errors.forEach(({ field, message }) => {
    fieldErrors = { ...fieldErrors, [field]: message };
  });
  return fieldErrors;
};
