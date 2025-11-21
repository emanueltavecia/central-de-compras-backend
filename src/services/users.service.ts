import { UsersRepository, OrganizationsRepository } from '@/repository'
import bcrypt from 'bcryptjs'
import { UserSchema } from '@/schemas'
import { UserAccountStatus, UserRole } from '@/enums'
import { HttpError } from '@/utils'

export class UsersService {
  private repo = new UsersRepository()
  private orgRepo = new OrganizationsRepository()

  async createUser(userData: UserSchema, currentUserId: string) {
    const emailExists = await this.repo.checkEmailExists(userData.email)
    if (emailExists) {
      throw new HttpError('E-mail já está em uso', 409, 'EMAIL_EXISTS')
    }

    const organization = await this.orgRepo.findById(userData.organizationId)
    if (!organization) {
      throw new HttpError('Organização inválida', 400, 'INVALID_ORGANIZATION')
    }

    let roleName: 'admin' | 'store' | 'supplier'
    switch (organization.type) {
      case 'central':
        roleName = 'admin'
        break
      case 'store':
        roleName = 'store'
        break
      case 'supplier':
        roleName = 'supplier'
        break
      default:
        throw new HttpError(
          'Tipo de organização inválido',
          400,
          'INVALID_ORG_TYPE',
        )
    }

    const plainPassword = userData.password!
    const hashedPassword = await bcrypt.hash(plainPassword, 12)

    return this.repo.create(
      {
        ...userData,
        password: hashedPassword,
        roleId: await this.repo.getRoleIdByName(roleName),
        status: UserAccountStatus.ACTIVE,
      },
      currentUserId,
    )
  }

  async getUsers(filters?: {
    status?: string
    roleId?: string
    organizationId?: string
  }) {
    return this.repo.findAll(filters)
  }

  async getUserById(id: string) {
    return this.repo.findById(id)
  }

  async updateUser(
    id: string,
    organizationId: string,
    userData: Partial<UserSchema>,
  ) {
    const existingUser = await this.repo.findById(id)
    if (!existingUser) {
      throw new HttpError('Usuário não encontrado', 404, 'USER_NOT_FOUND')
    }

    if (userData.email && userData.email !== existingUser.email) {
      const emailExists = await this.repo.checkEmailExists(userData.email)
      if (emailExists) {
        throw new HttpError('E-mail já está em uso', 409, 'EMAIL_EXISTS')
      }
    }

    const dataToUpdate: Partial<UserSchema> = { ...userData }
    if (userData.password) {
      dataToUpdate.password = await bcrypt.hash(userData.password, 12)
    }
    if (userData.organizationId) {
      const organization = await this.orgRepo.findById(userData.organizationId)
      if (!organization) {
        throw new HttpError('Organização inválida', 400, 'INVALID_ORGANIZATION')
      }

      let roleName: 'admin' | 'store' | 'supplier'
      switch (organization.type) {
        case 'central':
          roleName = 'admin'
          break
        case 'store':
          roleName = 'store'
          break
        case 'supplier':
          roleName = 'supplier'
          break
        default:
          throw new HttpError(
            'Tipo de organização inválido',
            400,
            'INVALID_ORG_TYPE',
          )
      }

      dataToUpdate.roleId = await this.repo.getRoleIdByName(roleName)
    }

    return this.repo.update(id, organizationId, dataToUpdate)
  }

  async updateStatus(
    id: string,
    status: UserAccountStatus,
    organizationId: string,
  ) {
    const user = await this.repo.findById(id)
    if (!user)
      throw new HttpError('Usuário não encontrado', 404, 'USER_NOT_FOUND')

    if (user.role?.name === UserRole.ADMIN) {
      throw new HttpError(
        'Não é possível alterar o status de um admin',
        400,
        'CANNOT_UPDATE_ADMIN',
      )
    }

    return this.repo.updateStatus(id, organizationId, status)
  }

  async deleteUser(id: string, currentUserId: string) {
    if (id === currentUserId) {
      throw new HttpError(
        'Não é possível excluir a si mesmo',
        400,
        'CANNOT_SELF_DELETE',
      )
    }

    // Verificar se o usuário está inativo
    const user = await this.repo.findById(id)
    if (!user) {
      throw new HttpError('Usuário não encontrado', 404, 'USER_NOT_FOUND')
    }

    if (user.status === UserAccountStatus.ACTIVE) {
      throw new HttpError(
        'Não é possível excluir um usuário ativo. Inative-o primeiro.',
        400,
        'CANNOT_DELETE_ACTIVE_USER',
      )
    }

    return this.repo.delete(id)
  }

  async getUserPermissions(id: string, organizationId: string) {
    return this.repo.getUserPermissions(id, organizationId)
  }

  async updateProfileImage(id: string, relativePath: string | null) {
    return this.repo.updateProfileImage(id, relativePath)
  }
}
