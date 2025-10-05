import { Request, Response } from 'express'
import { ApiController, ApiRoute } from '@/decorators'
import { ContactsService } from '@/services'
import { createErrorResponse, createSuccessResponse } from '@/utils'
import {
  ContactSchema,
  ErrorResponseSchema,
  SuccessResponseSchema,
  IdParamSchema,
  ContactFiltersSchema,
} from '@/schemas'

@ApiController('/contacts', ['Contacts'])
export class ContactsController {
  private contactsService: ContactsService

  constructor() {
    this.contactsService = new ContactsService()
  }

  @ApiRoute({
    method: 'post',
    path: '/',
    summary: 'Cadastrar um novo contato',
    body: ContactSchema,
    responses: {
      201: SuccessResponseSchema.create({
        schema: ContactSchema,
        dataDescription: 'Dados do contato cadastrado',
        message: 'Contato cadastrado com sucesso',
      }),
      400: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  })
  async createContact(contactData: ContactSchema, req: Request, res: Response) {
    try {
      const createdContact =
        await this.contactsService.createContact(contactData)

      return res
        .status(201)
        .json(
          createSuccessResponse(
            'Contato cadastrado com sucesso',
            createdContact,
          ),
        )
    } catch (error: any) {
      return res
        .status(error.statusCode || 500)
        .json(createErrorResponse(error.message, error.errorCode))
    }
  }

  @ApiRoute({
    method: 'get',
    path: '/',
    summary: 'Listar todos os contatos (opcionalmente por organização)',
    query: ContactFiltersSchema,
    responses: {
      200: SuccessResponseSchema.create({
        schema: ContactSchema,
        dataDescription: 'Lista de contatos',
        isArray: true,
        message: 'Contatos listados com sucesso',
      }),
      400: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  })
  async listContacts(req: Request, res: Response) {
    try {
      const filters = req.query as ContactFiltersSchema
      const contacts = await this.contactsService.listContacts(filters)

      return res
        .status(200)
        .json(createSuccessResponse('Contatos listados com sucesso', contacts))
    } catch (error: any) {
      return res
        .status(error.statusCode || 500)
        .json(createErrorResponse(error.message, error.errorCode))
    }
  }

  @ApiRoute({
    method: 'get',
    path: '/:id',
    summary: 'Obter um contato pelo ID',
    params: IdParamSchema,
    responses: {
      200: SuccessResponseSchema.create({
        schema: ContactSchema,
        dataDescription: 'Contato encontrado',
        message: 'Contato encontrado com sucesso',
      }),
      400: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  })
  async getContactById(req: Request, res: Response) {
    try {
      const { id } = req.params
      const contact = await this.contactsService.getContactById(id)

      return res
        .status(200)
        .json(createSuccessResponse('Contato encontrado com sucesso', contact))
    } catch (error: any) {
      return res
        .status(error.statusCode || 500)
        .json(createErrorResponse(error.message, error.errorCode))
    }
  }

  @ApiRoute({
    method: 'put',
    path: '/:id',
    summary: 'Atualizar um contato existente',
    params: IdParamSchema,
    body: ContactSchema,
    responses: {
      200: SuccessResponseSchema.create({
        schema: ContactSchema,
        dataDescription: 'Contato atualizado',
        message: 'Contato atualizado com sucesso',
      }),
      400: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  })
  async updateContact(
    contactData: Partial<ContactSchema>,
    req: Request,
    res: Response,
  ) {
    try {
      const { id } = req.params
      const updated = await this.contactsService.updateContact(id, contactData)

      return res
        .status(200)
        .json(createSuccessResponse('Contato atualizado com sucesso', updated))
    } catch (error: any) {
      return res
        .status(error.statusCode || 500)
        .json(createErrorResponse(error.message, error.errorCode))
    }
  }

  @ApiRoute({
    method: 'delete',
    path: '/:id',
    summary: 'Excluir um contato',
    params: IdParamSchema,
    responses: {
      200: SuccessResponseSchema.create({
        dataDescription: 'Confirmação de exclusão',
        message: 'Contato excluído com sucesso',
      }),
      400: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  })
  async deleteContact(req: Request, res: Response) {
    try {
      const { id } = req.params
      await this.contactsService.deleteContact(id)

      return res
        .status(200)
        .json(createSuccessResponse('Contato excluído com sucesso', null))
    } catch (error: any) {
      return res
        .status(error.statusCode || 500)
        .json(createErrorResponse(error.message, error.errorCode))
    }
  }

  @ApiRoute({
    method: 'patch',
    path: '/:id/set-primary',
    summary: 'Definir um contato como primário',
    params: IdParamSchema,
    responses: {
      200: SuccessResponseSchema.create({
        schema: ContactSchema,
        dataDescription: 'Contato definido como primário',
        message: 'Contato definido como primário com sucesso',
      }),
      400: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  })
  async setPrimaryContact(req: Request, res: Response) {
    try {
      const { id } = req.params
      const updatedContact = await this.contactsService.setPrimaryContact(id)

      return res
        .status(200)
        .json(
          createSuccessResponse(
            'Contato definido como primário com sucesso',
            updatedContact,
          ),
        )
    } catch (error: any) {
      return res
        .status(error.statusCode || 500)
        .json(createErrorResponse(error.message, error.errorCode))
    }
  }
}
