// LEGENDA
// ESTA FUNCIONANDO -> 🟢
// NÃO ESTA FUNCIONANDO -> 🔴 
import { UsersRepository } from '@/repository/users.repository'
import { OrganizationsRepository } from '@/repository/organizations.repository'
import bcrypt from 'bcryptjs'
import { UserSchema } from '@/schemas'
import { UserAccountStatus } from '@/enums'

export class UsersService {
    private repo = new UsersRepository()
    private orgRepo = new OrganizationsRepository()

    // CRIAR NOVO USUÁRIO 🟢
    async createUser(userData: UserSchema, currentUserId: string) {
        const emailExists = await this.repo.checkEmailExists(userData.email)
        if (emailExists) {
        throw { statusCode: 409, message: 'E-mail já está em uso', errorCode: 'EMAIL_EXISTS' }
        }

        const organization = await this.orgRepo.findById(userData.organizationId)
        if (!organization) {
        throw { statusCode: 400, message: 'Organização inválida', errorCode: 'INVALID_ORGANIZATION' }
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
            throw { statusCode: 400, message: 'Tipo de organização inválido', errorCode: 'INVALID_ORG_TYPE' }
        }

        const hashedPassword = await bcrypt.hash(userData.password!, 12)

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

    // BUSCAR USUÁRIO COM FILTROS 🟢
    async getUsers(filters?: { status?: string; roleId?: string; organizationId?: string }) {
        return this.repo.findAll(filters)
    }

    // BUSCAR USUÁRIO POR ID 🟢
    async getUserById(id: string) {
        return this.repo.findById(id)
    }

    // ATUALIZAR USUÁRIO 🟢
    async updateUser(id: string, organizationId: string, userData: Partial<UserSchema>) {
    if (userData.email) {
        const emailExists = await this.repo.checkEmailExists(userData.email)
        if (emailExists) {
        throw { statusCode: 409, message: 'E-mail já está em uso', errorCode: 'EMAIL_EXISTS' }
        }
    }

    let dataToUpdate: Partial<UserSchema> = { ...userData }

    if (userData.password) {
        dataToUpdate.password = await bcrypt.hash(userData.password, 12)
    }

    if (userData.organizationId) {
        const organization = await this.orgRepo.findById(userData.organizationId)
        if (!organization) {
        throw { statusCode: 400, message: 'Organização inválida', errorCode: 'INVALID_ORGANIZATION' }
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
            throw { statusCode: 400, message: 'Tipo de organização inválido', errorCode: 'INVALID_ORG_TYPE' }
        }

        dataToUpdate.roleId = await this.repo.getRoleIdByName(roleName)
    }

    return this.repo.update(id, organizationId, dataToUpdate)
    }

    // ATUALIZAR STATUS DO USUÁRIO 🟢
    async updateStatus(id: string, status: string, currentUserId: string) {
        if (id === currentUserId) {
            throw { statusCode: 400, message: 'Não é possível alterar seu próprio status', errorCode: 'CANNOT_SELF_DISABLE' }
        }

        const user = await this.repo.findById(id)
        if (!user) throw { statusCode: 404, message: 'Usuário não encontrado', errorCode: 'USER_NOT_FOUND' }

        if (user.role?.name === 'admin') {
            throw { statusCode: 400, message: 'Não é possível alterar o status de um admin', errorCode: 'CANNOT_UPDATE_ADMIN' }
        }

        return this.repo.updateStatus(id, status, currentUserId)
    }

    // DELETAR USUÁRIO 🟢
    async deleteUser(id: string, currentUserId: string) {
        if (id === currentUserId) {
            throw { statusCode: 400, message: 'Não é possível excluir a si mesmo', errorCode: 'CANNOT_SELF_DELETE' }
        }

        return this.repo.delete(id)
    }

    // OBTER PERMISSÕES DO USUÁRIO 🟢
    async getUserPermissions(id: string, organizationId: string) {
        return this.repo.getUserPermissions(id, organizationId)
    }
}
