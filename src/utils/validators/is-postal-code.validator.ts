import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'
import { VALIDATION_MESSAGES, REGEX } from '../consts'

@ValidatorConstraint({ name: 'isPostalCode', async: false })
export class IsPostalCodeValidator implements ValidatorConstraintInterface {
  validate(value: string): boolean {
    if (!value) {
      return true
    }

    return REGEX.POSTAL_CODE.test(value)
  }

  defaultMessage(): string {
    return VALIDATION_MESSAGES.INVALID_POSTAL_CODE
  }
}
