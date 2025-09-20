import { Enum } from '@/types'

export const VALIDATION_MESSAGES = {
  REQUIRED: 'Preenchimento obrigatório.',
  INVALID_UUID: 'Formato de ID inválido.',
  INVALID_STRING: 'Deve ser um texto válido.',
  INVALID_BOOLEAN: 'Deve ser verdadeiro ou falso.',
  INVALID_EMAIL: 'Formato de e-mail inválido.',
  INVALID_DATE: 'Formato de data inválido.',
  INVALID_POSTAL_CODE: 'Formato de CEP inválido.',
  INVALID_STATE: 'Estado deve ter 2 caracteres (UF).',
  INVALID_PHONE: 'Formato de telefone inválido.',
  INVALID_CPF: 'Formato de CPF inválido.',
  INVALID_CNPJ: 'Formato de CNPJ inválido.',
  INVALID_URL: 'Formato de URL inválido.',
  INVALID_NUMBER: 'Deve ser um número válido.',
  INVALID_INTEGER: 'Deve ser um número inteiro.',
  INVALID_POSITIVE: 'Deve ser um valor positivo.',
  INVALID_STRONG_PASSWORD:
    'A senha deve ter pelo menos 8 caracteres, incluindo maiúscula, minúscula, número e símbolo.',
  INVALID_DATE_RANGE: 'A data de fim deve ser posterior à data de início.',

  MIN_LENGTH: (min: number) =>
    `Deve ter pelo menos ${min} ${min === 1 ? 'caractere' : 'caracteres'}.`,
  MAX_LENGTH: (max: number) =>
    `Deve ter no máximo ${max} ${max === 1 ? 'caractere' : 'caracteres'}.`,
  EXACT_LENGTH: (length: number) =>
    `Deve ter exatamente ${length} ${length === 1 ? 'caractere' : 'caracteres'}.`,
  MIN_VALUE: (min: number) => `Deve ser no mínimo ${min}.`,
  MAX_VALUE: (max: number) => `Deve ser no máximo ${max}.`,
  MIN_QUANTITY: (min: number) => `A quantidade deve ser pelo menos ${min}.`,
  ARRAY_MIN_SIZE: (min: number) =>
    `Deve ter no mínimo ${min} ${min === 1 ? 'item' : 'itens'}.`,
  ARRAY_MAX_SIZE: (max: number) =>
    `Deve ter no máximo ${max} ${max === 1 ? 'item' : 'itens'}.`,
  INVALID_ENUM: (enumValues: Enum) =>
    `Deve ser um dos seguintes valores: ${Object.values(enumValues).join(', ')}.`,
}
