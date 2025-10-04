import { ContactRepository } from '@/repository/contacts.repository'
import { ContactSchema } from '@/schemas'
import { HttpError } from '@/utils'

// O IContact deve ser a interface de dado esperada do repositório
interface IContact extends ContactSchema {}

export class ContactsService {
  private contactRepository: ContactRepository
    contactsRepository: ContactRepository

  constructor() {
    this.contactRepository = new ContactRepository()
  }

  /**
    * Remove campos somente leitura (id, createdAt) antes de enviar para criação/atualização.
    * Segue o padrão do ProductService.
    */
  private removeReadOnlyFields(data: ContactSchema): Partial<ContactSchema> {
    const {
      id: _id,
      createdAt: _createdAt,
      ...cleanData
    } = data
    return cleanData
  }

  // --- R.E.A.D. (Listar Contatos) ---
  async listContacts(organizationId?: string): Promise<ContactSchema[]> {
    try {
      return await this.contactRepository.findAll(
        organizationId ? { organizationId } : undefined
      )
    } catch (error) {
      console.error('Error listing contacts:', error)
      throw new HttpError('Erro ao buscar contatos', 500, 'CONTACTS_GET_ERROR')
    }
  }

  // --- R.E.A.D. (Obter por ID) ---
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

  // --- C.R.E.A.T.E. ---
  async createContact(
  	contactData: Omit<ContactSchema, 'id' | 'createdAt'>,
  ): Promise<ContactSchema> {
  	try {
  		// Remove campos que seriam ignorados ou gerados pelo repositório
  		const cleanData = this.removeReadOnlyFields(contactData as ContactSchema)

  		// Validação: organizationId deve existir e ser string
  		if (!cleanData.organizationId || typeof cleanData.organizationId !== 'string') {
  			throw new HttpError('organizationId é obrigatório', 400, 'CONTACT_ORGID_REQUIRED')
  		}

  		// Repositório é responsável por gerar o ID e o createdAt
    	return await this.contactRepository.create(cleanData as Omit<ContactSchema, 'id' | 'createdAt'>)
  	} catch (error) {
  		console.error('Error creating contact:', error)
  		throw new HttpError('Erro ao criar contato', 500, 'CONTACT_CREATE_ERROR')
  	}
  }

  // --- U.P.D.A.T.E. ---
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
  			// Este erro só deve ocorrer se o repositório falhar internamente
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
  		throw new HttpError('Erro ao atualizar contato', 500, 'CONTACT_UPDATE_ERROR')
  	}
  }

  // --- D.E.L.E.T.E. ---
  async deleteContact(id: string): Promise<void> {
  	try {
  		const deleted = await this.contactRepository.delete(id)
  		
  		if (!deleted) {
  			// Se delete retorna false, o recurso não foi encontrado
  			throw new HttpError('Contato não encontrado', 404, 'CONTACT_NOT_FOUND')
  		}
  	} catch (error) {
  		if (error instanceof HttpError) {
  			throw error
  		}
  		console.error('Error deleting contact:', error)
  		throw new HttpError('Erro ao deletar contato', 500, 'CONTACT_DELETE_ERROR')
  	}
  }
}