import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { AuthRepository } from '@/repository'
import { UserSchema, LoginSchema, AuthResponseSchema } from '@/schemas'
import { config } from '@/config'
import { HttpError } from '@/utils'

export class AuthService {
  private userRepository: AuthRepository

  constructor() {
    this.userRepository = new AuthRepository()
  }

  async login(loginData: LoginSchema): Promise<AuthResponseSchema> {
    const { email, password } = loginData

    const user = await this.userRepository.findByEmail(email)
    if (!user) {
      throw new HttpError('Credenciais inválidas', 401, 'UNAUTHORIZED')
    }

    if (user.status !== 'active') {
      throw new HttpError('Conta inativa ou suspensa', 401, 'UNAUTHORIZED')
    }

    const isPasswordValid = await bcrypt.compare(password, user.password!)
    if (!isPasswordValid) {
      throw new HttpError('Credenciais inválidas', 401, 'UNAUTHORIZED')
    }

    const token = this.generateToken(user)

    const { password: _, ...userWithoutPassword } = user

    return {
      token,
      user: userWithoutPassword as UserSchema,
    }
  }

  async register(
    userData: UserSchema,
    createdByUserId: string,
  ): Promise<UserSchema> {
    const createdByUser = await this.userRepository.findById(createdByUserId)
    if (!createdByUser) {
      throw new HttpError('Usuário criador não encontrado', 400, 'BAD_REQUEST')
    }

    const creatorPermissions = await this.userRepository.getRolePermissions(
      createdByUser.roleId,
    )
    if (!creatorPermissions.includes('manage_users')) {
      throw new HttpError(
        'Usuário não tem permissão para criar novos usuários',
        403,
        'FORBIDDEN',
      )
    }

    const emailExists = await this.userRepository.checkEmailExists(
      userData.email,
    )
    if (emailExists) {
      throw new HttpError('Email já está em uso', 409, 'CONFLICT')
    }

    const roleExists = await this.userRepository.checkRoleExists(
      userData.roleId,
    )
    if (!roleExists) {
      throw new HttpError('Role especificada não existe', 400, 'BAD_REQUEST')
    }

    if (userData.organizationId) {
      const organizationExists =
        await this.userRepository.checkOrganizationExists(
          userData.organizationId,
        )
      if (!organizationExists) {
        throw new HttpError(
          'Organização especificada não existe ou está inativa',
          400,
          'BAD_REQUEST',
        )
      }
    }

    const hashedPassword = await bcrypt.hash(userData.password!, 12)

    const newUser = await this.userRepository.create(
      {
        ...userData,
        password: hashedPassword,
      },
      createdByUserId,
    )

    const { password: _, ...userWithoutPassword } = newUser
    return userWithoutPassword as UserSchema
  }

  async getUserProfile(userId: string): Promise<UserSchema> {
    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw new HttpError('Usuário não encontrado', 404, 'NOT_FOUND')
    }

    const { password: _, ...userWithoutPassword } = user
    return userWithoutPassword as UserSchema
  }

  private generateToken(user: UserSchema): string {
    const { password: _, ...payload } = user

    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    })
  }

  verifyToken(token: string): any {
    try {
      return jwt.verify(token, config.jwt.secret)
    } catch (error) {
      throw new HttpError('Token inválido', 401, 'UNAUTHORIZED')
    }
  }
}
