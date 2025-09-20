import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'
import { cpf, cnpj } from 'cpf-cnpj-validator'
import { VALIDATION_MESSAGES, REGEX } from '@/utils'

@ValidatorConstraint({ name: 'isCpf', async: false })
export class IsCpfValidator implements ValidatorConstraintInterface {
  validate(value: string): boolean {
    if (!value) {
      return true
    }

    if (!REGEX.ONLY_NUMBERS.test(value)) {
      return false
    }

    return cpf.isValid(value)
  }

  defaultMessage(): string {
    return VALIDATION_MESSAGES.INVALID_CPF
  }
}

@ValidatorConstraint({ name: 'isCnpj', async: false })
export class IsCnpjValidator implements ValidatorConstraintInterface {
  validate(value: string): boolean {
    if (!value) {
      return true
    }

    if (!REGEX.ONLY_NUMBERS.test(value)) {
      return false
    }

    return cnpj.isValid(value)
  }

  defaultMessage(): string {
    return VALIDATION_MESSAGES.INVALID_CNPJ
  }
}

@ValidatorConstraint({ name: 'isCpfCnpj', async: false })
export class IsCpfCnpjValidator implements ValidatorConstraintInterface {
  validate(value: string): boolean {
    if (!value) {
      return true
    }

    if (!REGEX.ONLY_NUMBERS.test(value)) {
      return false
    }

    return cpf.isValid(value) || cnpj.isValid(value)
  }

  defaultMessage(): string {
    return VALIDATION_MESSAGES.INVALID_CPF_CNPJ
  }
}
