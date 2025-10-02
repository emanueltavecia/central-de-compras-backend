import { CampaignsRepository } from '@/repository'
import { CampaignSchema, CampaignFiltersSchema } from '@/schemas'
import { HttpError } from '@/utils'

export class CampaignsService {
  private campaignsRepository: CampaignsRepository

  constructor() {
    this.campaignsRepository = new CampaignsRepository()
  }

  private removeReadOnlyFields(data: CampaignSchema): CampaignSchema {
    const {
      id: _id,
      active: _active,
      createdAt: _createdAt,
      ...cleanData
    } = data
    return cleanData as CampaignSchema
  }

  async createCampaign(
    campaignData: Omit<CampaignSchema, 'id' | 'createdAt'>,
  ): Promise<CampaignSchema> {
    try {
      const cleanData = this.removeReadOnlyFields(
        campaignData as CampaignSchema,
      )
      return await this.campaignsRepository.create(cleanData)
    } catch (error) {
      console.error('Error creating campaign:', error)
      throw new HttpError(
        'Erro ao criar campanha',
        500,
        'CAMPAIGN_CREATE_ERROR',
      )
    }
  }

  async getCampaignById(id: string): Promise<CampaignSchema> {
    try {
      const campaign = await this.campaignsRepository.findById(id)

      if (!campaign) {
        throw new HttpError(
          'Campanha não encontrada',
          404,
          'CAMPAIGN_NOT_FOUND',
        )
      }

      return campaign
    } catch (error) {
      if (error instanceof HttpError) {
        throw error
      }
      console.error('Error getting campaign by id:', error)
      throw new HttpError('Erro ao buscar campanha', 500, 'CAMPAIGN_GET_ERROR')
    }
  }

  async getAllCampaigns(
    filters: CampaignFiltersSchema = {},
  ): Promise<CampaignSchema[]> {
    try {
      const result = await this.campaignsRepository.findAll(filters)

      return result.campaigns
    } catch (error) {
      console.error('Error getting campaigns:', error)
      throw new HttpError(
        'Erro ao buscar campanhas',
        500,
        'CAMPAIGNS_GET_ERROR',
      )
    }
  }

  async updateCampaign(
    id: string,
    campaignData: Partial<Omit<CampaignSchema, 'id' | 'createdAt'>>,
  ): Promise<CampaignSchema> {
    try {
      const existingCampaign = await this.campaignsRepository.findById(id)

      if (!existingCampaign) {
        throw new HttpError(
          'Campanha não encontrada',
          404,
          'CAMPAIGN_NOT_FOUND',
        )
      }

      const cleanData = this.removeReadOnlyFields(
        campaignData as CampaignSchema,
      )

      const updatedCampaign = await this.campaignsRepository.update(
        id,
        cleanData,
      )

      if (!updatedCampaign) {
        throw new HttpError(
          'Erro ao atualizar campanha',
          500,
          'CAMPAIGN_UPDATE_ERROR',
        )
      }

      return updatedCampaign
    } catch (error) {
      if (error instanceof HttpError) {
        throw error
      }
      console.error('Error updating campaign:', error)
      throw new HttpError(
        'Erro ao atualizar campanha',
        500,
        'CAMPAIGN_UPDATE_ERROR',
      )
    }
  }

  async deleteCampaign(id: string): Promise<void> {
    try {
      const existingCampaign = await this.campaignsRepository.findById(id)

      if (!existingCampaign) {
        throw new HttpError(
          'Campanha não encontrada',
          404,
          'CAMPAIGN_NOT_FOUND',
        )
      }

      const deleted = await this.campaignsRepository.delete(id)

      if (!deleted) {
        throw new HttpError(
          'Erro ao deletar campanha',
          500,
          'CAMPAIGN_DELETE_ERROR',
        )
      }
    } catch (error) {
      if (error instanceof HttpError) {
        throw error
      }
      console.error('Error deleting campaign:', error)
      throw new HttpError(
        'Erro ao deletar campanha',
        500,
        'CAMPAIGN_DELETE_ERROR',
      )
    }
  }

  async toggleCampaignStatus(
    id: string,
    active: boolean,
  ): Promise<CampaignSchema> {
    try {
      const existingCampaign = await this.campaignsRepository.findById(id)

      if (!existingCampaign) {
        throw new HttpError(
          'Campanha não encontrada',
          404,
          'CAMPAIGN_NOT_FOUND',
        )
      }

      const updatedCampaign = await this.campaignsRepository.update(id, {
        active,
      })

      if (!updatedCampaign) {
        throw new HttpError(
          'Erro ao alterar status da campanha',
          500,
          'CAMPAIGN_STATUS_UPDATE_ERROR',
        )
      }

      return updatedCampaign
    } catch (error) {
      if (error instanceof HttpError) {
        throw error
      }
      console.error('Error toggling campaign status:', error)
      throw new HttpError(
        'Erro ao alterar status da campanha',
        500,
        'CAMPAIGN_STATUS_UPDATE_ERROR',
      )
    }
  }
}
