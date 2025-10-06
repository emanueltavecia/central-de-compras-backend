import { Request, Response } from 'express'
import { ApiController, ApiRoute } from '@/decorators'
import { PermissionName } from '@/enums'
import { AuthenticatedRequest } from '@/middlewares'
import {
  AddressSchema,
  ErrorResponseSchema,
  SuccessResponseSchema,
  IdParamSchema,
} from '@/schemas'
import { OrganizationsService, AddressService } from '@/services'
import { createErrorResponse, createSuccessResponse } from '@/utils'

@ApiController('/organizations/:organizationId/addresses', [
  'Organization Addresses',
])
export class OrganizationAddressesController {
  private organizationsService = new OrganizationsService()
  private addressService = new AddressService()

  @ApiRoute({
    method: 'get',
    path: '/',
    summary: 'Listar endereços de uma organização',
    params: IdParamSchema,
    responses: {
      200: SuccessResponseSchema.create({
        schema: AddressSchema,
        isArray: true,
        dataDescription: 'Lista de endereços da organização',
        message: 'Endereços obtidos com sucesso',
      }),
      401: ErrorResponseSchema,
      403: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  })
  async getAddresses(req: Request, res: Response) {
    try {
      const { organizationId } = req.params

      await this.organizationsService.getOrganizationById(organizationId, false)

      const addresses =
        await this.addressService.getAddressesByOrganization(organizationId)

      return res
        .status(200)
        .json(createSuccessResponse('Endereços obtidos com sucesso', addresses))
    } catch (error: any) {
      return res
        .status(error.statusCode || 500)
        .json(createErrorResponse(error.message, error.errorCode))
    }
  }

  @ApiRoute({
    method: 'post',
    path: '/',
    summary: 'Criar novo endereço para uma organização',
    permissions: [PermissionName.MANAGE_ORGANIZATIONS],
    params: IdParamSchema,
    body: AddressSchema,
    responses: {
      201: SuccessResponseSchema.create({
        schema: AddressSchema,
        dataDescription: 'Dados do endereço criado',
        message: 'Endereço criado com sucesso',
      }),
      400: ErrorResponseSchema,
      401: ErrorResponseSchema,
      403: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  })
  async createAddress(
    addressData: AddressSchema,
    req: AuthenticatedRequest,
    res: Response,
  ) {
    try {
      const { organizationId } = req.params

      await this.organizationsService.getOrganizationById(organizationId, false)

      const addressWithOrgId = {
        ...addressData,
        organizationId,
      }

      const newAddress =
        await this.addressService.createAddress(addressWithOrgId)

      return res
        .status(201)
        .json(createSuccessResponse('Endereço criado com sucesso', newAddress))
    } catch (error: any) {
      return res
        .status(error.statusCode || 500)
        .json(createErrorResponse(error.message, error.errorCode))
    }
  }

  @ApiRoute({
    method: 'put',
    path: '/:addressId',
    summary: 'Atualizar endereço de uma organização',
    permissions: [PermissionName.MANAGE_ORGANIZATIONS],
    params: IdParamSchema,
    body: AddressSchema,
    responses: {
      200: SuccessResponseSchema.create({
        schema: AddressSchema,
        dataDescription: 'Dados do endereço atualizado',
        message: 'Endereço atualizado com sucesso',
      }),
      400: ErrorResponseSchema,
      401: ErrorResponseSchema,
      403: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  })
  async updateAddress(addressData: AddressSchema, req: Request, res: Response) {
    try {
      const { organizationId, addressId } = req.params

      await this.organizationsService.getOrganizationById(organizationId, false)

      const updatedAddress = await this.addressService.updateAddress(
        addressId,
        addressData,
      )

      return res
        .status(200)
        .json(
          createSuccessResponse(
            'Endereço atualizado com sucesso',
            updatedAddress,
          ),
        )
    } catch (error: any) {
      return res
        .status(error.statusCode || 500)
        .json(createErrorResponse(error.message, error.errorCode))
    }
  }

  @ApiRoute({
    method: 'delete',
    path: '/:addressId',
    summary: 'Deletar endereço de uma organização',
    permissions: [PermissionName.MANAGE_ORGANIZATIONS],
    params: IdParamSchema,
    responses: {
      200: SuccessResponseSchema.create({
        schema: AddressSchema,
        dataDescription: 'Confirmação de exclusão',
        message: 'Endereço deletado com sucesso',
      }),
      401: ErrorResponseSchema,
      403: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  })
  async deleteAddress(req: Request, res: Response) {
    try {
      const { organizationId, addressId } = req.params

      await this.organizationsService.getOrganizationById(organizationId, false)

      await this.addressService.deleteAddress(addressId)

      return res
        .status(200)
        .json(createSuccessResponse('Endereço deletado com sucesso', null))
    } catch (error: any) {
      return res
        .status(error.statusCode || 500)
        .json(createErrorResponse(error.message, error.errorCode))
    }
  }

  @ApiRoute({
    method: 'patch',
    path: '/:addressId/primary',
    summary: 'Definir endereço como primário',
    permissions: [PermissionName.MANAGE_ORGANIZATIONS],
    params: IdParamSchema,
    responses: {
      200: SuccessResponseSchema.create({
        schema: AddressSchema,
        dataDescription: 'Dados do endereço definido como primário',
        message: 'Endereço definido como primário com sucesso',
      }),
      400: ErrorResponseSchema,
      401: ErrorResponseSchema,
      403: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  })
  async setPrimaryAddress(req: Request, res: Response) {
    try {
      const { organizationId, addressId } = req.params

      await this.organizationsService.getOrganizationById(organizationId, false)

      const updatedAddress =
        await this.addressService.setPrimaryAddress(addressId)

      return res
        .status(200)
        .json(
          createSuccessResponse(
            'Endereço definido como primário com sucesso',
            updatedAddress,
          ),
        )
    } catch (error: any) {
      return res
        .status(error.statusCode || 500)
        .json(createErrorResponse(error.message, error.errorCode))
    }
  }
}
