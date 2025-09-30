import { Request, Response } from 'express'
import { ApiController, ApiRoute } from '@/decorators'
import { CampaignsService } from '@/services'
import { createErrorResponse, createSuccessResponse } from '@/utils'
import {
  CampaignSchema,
  CampaignFiltersSchema,
  CampaignStatusSchema,
  ErrorResponseSchema,
  SuccessResponseSchema,
} from '@/schemas'

@ApiController('/campaigns', ['Campaigns'])
export class CampaignsController {
  private campaignsService: CampaignsService

  constructor() {
    this.campaignsService = new CampaignsService()
  }

  @ApiRoute({
    method: 'post',
    path: '/',
    summary: 'Criar nova campanha',
    body: CampaignSchema,
    responses: {
      201: SuccessResponseSchema.create({
        schema: CampaignSchema,
        dataDescription: 'Dados da campanha criada',
        message: 'Campanha criada com sucesso',
      }),
      400: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  })
  async createCampaign(
    campaignData: CampaignSchema,
    req: Request,
    res: Response,
  ) {
    try {
      const campaign = await this.campaignsService.createCampaign(campaignData)

      return res
        .status(201)
        .json(createSuccessResponse('Campanha criada com sucesso', campaign))
    } catch (error: any) {
      return res
        .status(error.statusCode || 500)
        .json(createErrorResponse(error.message, error.errorCode))
    }
  }

  @ApiRoute({
    method: 'get',
    path: '/:id',
    summary: 'Buscar campanha por ID',
    responses: {
      200: SuccessResponseSchema.create({
        schema: CampaignSchema,
        dataDescription: 'Dados da campanha',
        message: 'Campanha encontrada',
      }),
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  })
  async getCampaignById(req: Request, res: Response) {
    try {
      const { id } = req.params
      const campaign = await this.campaignsService.getCampaignById(id)

      return res
        .status(200)
        .json(createSuccessResponse('Campanha encontrada', campaign))
    } catch (error: any) {
      return res
        .status(error.statusCode || 500)
        .json(createErrorResponse(error.message, error.errorCode))
    }
  }

  @ApiRoute({
    method: 'get',
    path: '/',
    summary: 'Listar campanhas com filtros',
    query: CampaignFiltersSchema,
    responses: {
      200: SuccessResponseSchema.create({
        schema: CampaignSchema,
        isArray: true,
        dataDescription: 'Lista de campanhas',
        message: 'Campanhas listadas com sucesso',
      }),
      400: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  })
  async getAllCampaigns(req: Request, res: Response) {
    try {
      const filters = req.query as unknown as CampaignFiltersSchema

      const campaigns = await this.campaignsService.getAllCampaigns(filters)

      return res
        .status(200)
        .json(
          createSuccessResponse('Campanhas listadas com sucesso', campaigns),
        )
    } catch (error: any) {
      return res
        .status(error.statusCode || 500)
        .json(createErrorResponse(error.message, error.errorCode))
    }
  }

  @ApiRoute({
    method: 'put',
    path: '/:id',
    summary: 'Atualizar campanha',
    body: CampaignSchema,
    responses: {
      200: SuccessResponseSchema.create({
        schema: CampaignSchema,
        dataDescription: 'Dados da campanha atualizada',
        message: 'Campanha atualizada com sucesso',
      }),
      400: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  })
  async updateCampaign(
    campaignData: Partial<CampaignSchema>,
    req: Request,
    res: Response,
  ) {
    try {
      const { id } = req.params
      const campaign = await this.campaignsService.updateCampaign(
        id,
        campaignData,
      )

      return res
        .status(200)
        .json(
          createSuccessResponse('Campanha atualizada com sucesso', campaign),
        )
    } catch (error: any) {
      return res
        .status(error.statusCode || 500)
        .json(createErrorResponse(error.message, error.errorCode))
    }
  }

  @ApiRoute({
    method: 'patch',
    path: '/:id/status',
    summary: 'Alterar status ativo da campanha',
    body: CampaignStatusSchema,
    responses: {
      200: SuccessResponseSchema.create({
        schema: CampaignSchema,
        dataDescription: 'Dados da campanha com status atualizado',
        message: 'Status da campanha alterado com sucesso',
      }),
      400: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  })
  async toggleCampaignStatus(
    statusData: CampaignStatusSchema,
    req: Request,
    res: Response,
  ) {
    try {
      const { id } = req.params
      const campaign = await this.campaignsService.toggleCampaignStatus(
        id,
        statusData.active,
      )

      return res
        .status(200)
        .json(
          createSuccessResponse(
            'Status da campanha alterado com sucesso',
            campaign,
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
    path: '/:id',
    summary: 'Excluir campanha',
    responses: {
      200: SuccessResponseSchema.create({
        dataDescription: 'Confirmação de exclusão',
        message: 'Campanha excluída com sucesso',
      }),
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  })
  async deleteCampaign(req: Request, res: Response) {
    try {
      const { id } = req.params
      await this.campaignsService.deleteCampaign(id)

      return res
        .status(200)
        .json(createSuccessResponse('Campanha excluída com sucesso', null))
    } catch (error: any) {
      return res
        .status(error.statusCode || 500)
        .json(createErrorResponse(error.message, error.errorCode))
    }
  }
}
