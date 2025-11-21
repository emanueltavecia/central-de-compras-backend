import { ContactRepository } from '@/repository'
import { ContactSchema, ContactFiltersSchema } from '@/schemas'
import { HttpError } from '@/utils'

export class ContactsService {
  private contactRepository: ContactRepository

  constructor() {
    this.contactRepository = new ContactRepository()
  }

  private removeReadOnlyFields(data: ContactSchema): Partial<ContactSchema> {
    const { id: _id, createdAt: _createdAt, ...cleanData } = data
    return cleanData
  }

  async listContacts(
    filters: ContactFiltersSchema = {},
  ): Promise<ContactSchema[]> {
    try {
      return await this.contactRepository.findAll(filters)
    } catch (error) {
      console.error('Error listing contacts:', error)
      throw new HttpError('Erro ao buscar contatos', 500, 'CONTACTS_GET_ERROR')
    }
  }

  async getContactById(id: string): Promise<ContactSchema> {
    try {
      const contact = await this.contactRepository.findById(id)

      if (!contact) {
        throw new HttpError('Contato não encontrado', 404, 'CONTACT_NOT_FOUND')
      }

      return contact
    } catch (error) {
      if (error instanceof HttpError) {
        throw error
      }
      console.error('Error getting contact by id:', error)
      throw new HttpError('Erro ao buscar contato', 500, 'CONTACT_GET_ERROR')
    }
  }

  async createContact(
    contactData: Omit<ContactSchema, 'id' | 'createdAt'>,
  ): Promise<ContactSchema> {
    try {
      const cleanData = this.removeReadOnlyFields(contactData as ContactSchema)

      if (
        !cleanData.organizationId ||
        typeof cleanData.organizationId !== 'string'
      ) {
        throw new HttpError(
          'organizationId é obrigatório',
          400,
          'CONTACT_ORGID_REQUIRED',
        )
      }

      return await this.contactRepository.create(
        cleanData as Omit<ContactSchema, 'id' | 'createdAt'>,
      )
    } catch (error) {
      console.error('Error creating contact:', error)
      throw new HttpError('Erro ao criar contato', 500, 'CONTACT_CREATE_ERROR')
    }
  }

  async updateContact(
    id: string,
    contactData: Partial<Omit<ContactSchema, 'id' | 'createdAt'>>,
  ): Promise<ContactSchema> {
    try {
      const existingContact = await this.contactRepository.findById(id)

      if (!existingContact) {
        throw new HttpError('Contato não encontrado', 404, 'CONTACT_NOT_FOUND')
      }

      const cleanData = this.removeReadOnlyFields(contactData as ContactSchema)

      const updatedContact = await this.contactRepository.update(id, cleanData)

      if (!updatedContact) {
        throw new HttpError(
          'Erro ao atualizar contato',
          500,
          'CONTACT_UPDATE_ERROR',
        )
      }

      return updatedContact
    } catch (error) {
      if (error instanceof HttpError) {
        throw error
      }
      console.error('Error updating contact:', error)
      throw new HttpError(
        'Erro ao atualizar contato',
        500,
        'CONTACT_UPDATE_ERROR',
      )
    }
  }

  async deleteContact(id: string): Promise<void> {
    try {
      const deleted = await this.contactRepository.delete(id)
      if (!deleted) {
        throw new HttpError('Contato não encontrado', 404, 'CONTACT_NOT_FOUND')
      }
    } catch (error) {
      if (error instanceof HttpError) {
        throw error
      }
      console.error('Error deleting contact:', error)
      throw new HttpError(
        'Erro ao deletar contato',
        500,
        'CONTACT_DELETE_ERROR',
      )
    }
  }

  async setPrimaryContact(id: string): Promise<ContactSchema> {
    try {
      const updatedContact = await this.contactRepository.setPrimaryContact(id)

      if (!updatedContact) {
        throw new HttpError('Contato não encontrado', 404, 'CONTACT_NOT_FOUND')
      }

      return updatedContact
    } catch (error) {
      if (error instanceof HttpError) {
        throw error
      }
      console.error('Error setting primary contact:', error)
      throw new HttpError(
        'Erro ao definir contato primário',
        500,
        'CONTACT_SET_PRIMARY_ERROR',
      )
    }
  }

  async unsetPrimaryContact(id: string): Promise<ContactSchema> {
    try {
      const updatedContact = await this.contactRepository.unsetPrimaryContact(id)

      if (!updatedContact) {
        throw new HttpError('Contato não encontrado', 404, 'CONTACT_NOT_FOUND')
      }

      return updatedContact
    } catch (error) {
      if (error instanceof HttpError) {
        throw error
      }
      console.error('Error unsetting primary contact:', error)
      throw new HttpError(
        'Erro ao remover contato primário',
        500,
        'CONTACT_UNSET_PRIMARY_ERROR',
      )
    }
  }
}
