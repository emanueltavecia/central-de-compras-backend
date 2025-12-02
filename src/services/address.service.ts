import { AddressRepository } from '@/repository'
import { AddressSchema } from '@/schemas'
import { HttpError } from '@/utils'

export class AddressService {
  private addressRepository: AddressRepository

  constructor() {
    this.addressRepository = new AddressRepository()
  }

  private removeReadOnlyFields(data: AddressSchema): Partial<AddressSchema> {
    const {
      id: _id,
      createdAt: _createdAt,
      organizationId: _organizationId,
      ...cleanData
    } = data
    return cleanData
  }

  async getAddressesByOrganization(
    organizationId: string,
  ): Promise<AddressSchema[]> {
    try {
      return await this.addressRepository.findByOrganizationId(organizationId)
    } catch (error) {
      console.error('Error getting addresses by organization:', error)
      throw new HttpError(
        'Erro ao buscar endereços da organização',
        500,
        'ADDRESSES_GET_ERROR',
      )
    }
  }

  async createAddress(
    addressData: Omit<AddressSchema, 'id' | 'createdAt'>,
  ): Promise<AddressSchema> {
    try {
      const cleanData = this.removeReadOnlyFields(addressData as AddressSchema)

      if (
        !addressData.organizationId ||
        typeof addressData.organizationId !== 'string'
      ) {
        throw new HttpError(
          'organizationId é obrigatório',
          400,
          'ORGANIZATION_ID_REQUIRED',
        )
      }

      if (!cleanData.street || typeof cleanData.street !== 'string') {
        throw new HttpError('street é obrigatório', 400, 'STREET_REQUIRED')
      }

      if (
        !cleanData.neighborhood ||
        typeof cleanData.neighborhood !== 'string'
      ) {
        throw new HttpError(
          'neighborhood é obrigatório',
          400,
          'NEIGHBORHOOD_REQUIRED',
        )
      }

      if (!cleanData.city || typeof cleanData.city !== 'string') {
        throw new HttpError('city é obrigatório', 400, 'CITY_REQUIRED')
      }

      if (!cleanData.state || typeof cleanData.state !== 'string') {
        throw new HttpError('state é obrigatório', 400, 'STATE_REQUIRED')
      }

      if (!cleanData.postalCode || typeof cleanData.postalCode !== 'string') {
        throw new HttpError(
          'postalCode é obrigatório',
          400,
          'POSTAL_CODE_REQUIRED',
        )
      }

      return await this.addressRepository.create(addressData)
    } catch (error) {
      if (error instanceof HttpError) {
        throw error
      }
      console.error('Error creating address:', error)
      throw new HttpError('Erro ao criar endereço', 500, 'ADDRESS_CREATE_ERROR')
    }
  }

  async updateAddress(
    id: string,
    addressData: Partial<
      Omit<AddressSchema, 'id' | 'createdAt' | 'organizationId'>
    >,
  ): Promise<AddressSchema> {
    try {
      const cleanData = this.removeReadOnlyFields(addressData as AddressSchema)

      if (
        addressData.street !== undefined &&
        typeof addressData.street !== 'string'
      ) {
        throw new HttpError('street deve ser uma string', 400, 'INVALID_STREET')
      }

      if (
        addressData.neighborhood !== undefined &&
        typeof addressData.neighborhood !== 'string'
      ) {
        throw new HttpError(
          'neighborhood deve ser uma string',
          400,
          'INVALID_NEIGHBORHOOD',
        )
      }

      if (
        addressData.city !== undefined &&
        typeof addressData.city !== 'string'
      ) {
        throw new HttpError('city deve ser uma string', 400, 'INVALID_CITY')
      }

      if (
        addressData.state !== undefined &&
        typeof addressData.state !== 'string'
      ) {
        throw new HttpError('state deve ser uma string', 400, 'INVALID_STATE')
      }

      if (
        addressData.postalCode !== undefined &&
        typeof addressData.postalCode !== 'string'
      ) {
        throw new HttpError(
          'postalCode deve ser uma string',
          400,
          'INVALID_POSTAL_CODE',
        )
      }

      const updatedAddress = await this.addressRepository.update(id, cleanData)

      if (!updatedAddress) {
        throw new HttpError('Endereço não encontrado', 404, 'ADDRESS_NOT_FOUND')
      }

      return updatedAddress
    } catch (error) {
      if (error instanceof HttpError) {
        throw error
      }
      console.error('Error updating address:', error)
      throw new HttpError(
        'Erro ao atualizar endereço',
        500,
        'ADDRESS_UPDATE_ERROR',
      )
    }
  }

  async deleteAddress(id: string): Promise<void> {
    try {
      const deleted = await this.addressRepository.delete(id)
      if (!deleted) {
        throw new HttpError('Endereço não encontrado', 404, 'ADDRESS_NOT_FOUND')
      }
    } catch (error) {
      if (error instanceof HttpError) {
        throw error
      }
      console.error('Error deleting address:', error)
      throw new HttpError(
        'Erro ao deletar endereço',
        500,
        'ADDRESS_DELETE_ERROR',
      )
    }
  }

  async createAddressesForOrganization(
    organizationId: string,
    addresses: Omit<AddressSchema, 'id' | 'createdAt' | 'organizationId'>[],
  ): Promise<AddressSchema[]> {
    try {
      const createdAddresses: AddressSchema[] = []

      for (const addressData of addresses) {
        const addressWithOrgId = {
          ...addressData,
          organizationId,
        }
        const createdAddress = await this.createAddress(addressWithOrgId)
        createdAddresses.push(createdAddress)
      }

      return createdAddresses
    } catch (error) {
      if (error instanceof HttpError) {
        throw error
      }
      console.error('Error creating addresses for organization:', error)
      throw new HttpError(
        'Erro ao criar endereços da organização',
        500,
        'ADDRESSES_CREATE_ERROR',
      )
    }
  }

  async deleteAddressesByOrganization(organizationId: string): Promise<void> {
    try {
      await this.addressRepository.deleteByOrganizationId(organizationId)
    } catch (error) {
      console.error('Error deleting addresses by organization:', error)
      throw new HttpError(
        'Erro ao deletar endereços da organização',
        500,
        'ADDRESSES_DELETE_ERROR',
      )
    }
  }
}
