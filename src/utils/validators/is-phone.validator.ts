import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'
import { VALIDATION_MESSAGES, REGEX } from '@/utils'

@ValidatorConstraint({ name: 'isPhone', async: false })
export class IsPhoneValidator implements ValidatorConstraintInterface {
  validate(phone: string) {
    if (!phone) {
      return true
    }

    const onlyNumbers = REGEX.ONLY_NUMBERS.test(phone)
    if (!onlyNumbers) {
      return false
    }

    if (phone.length < 10 || phone.length > 11) {
      return false
    }

    const allSameDigit = REGEX.ALL_SAME_DIGIT.test(phone)
    if (allSameDigit) {
      return false
    }

    return true
  }

  defaultMessage() {
    return VALIDATION_MESSAGES.INVALID_PHONE
  }
}
