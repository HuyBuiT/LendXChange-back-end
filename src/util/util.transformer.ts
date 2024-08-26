import { TransformFnParams } from 'class-transformer';
import { ValidationError } from 'class-validator';
import { chain, isEmpty, split } from 'lodash';

export function transformQueryArray(params: TransformFnParams) {
  const { value } = params;
  if (!isEmpty(value)) {
    if (typeof value === 'string') {
      return split(value, ',');
    }
    return value;
  }

  return null;
}

export const transfromBigInt = {
  to: (value) => value,
  from: (value) => parseInt(value, 10) || null,
};

export const flatValidationErrors = (
  validationErrors: ValidationError[],
): string[] => {
  return chain(validationErrors)
    .map((err) => err.constraints)
    .map((constraint) => Object.values(constraint))
    .flatten()
    .value();
};
