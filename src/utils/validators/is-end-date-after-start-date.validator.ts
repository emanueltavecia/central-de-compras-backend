import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator'
import { VALIDATION_MESSAGES } from '@/utils'

@ValidatorConstraint({ name: 'isEndDateAfterStartDate', async: false })
export class IsEndDateAfterStartDateValidator implements ValidatorConstraintInterface {
  validate(endAt: string, args: ValidationArguments) {
    const { startAt } = args.object as any
    if (!startAt || !endAt) {
      return true
    }
    return new Date(endAt) > new Date(startAt)
  }

  defaultMessage() {
    return VALIDATION_MESSAGES.INVALID_DATE_RANGE
  }
}
