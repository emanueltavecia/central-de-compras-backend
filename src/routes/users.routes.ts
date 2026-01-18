import { Router } from 'express'
import type { Router as ExpressRouter } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { authMiddleware } from '@/middlewares'
import { UsersService } from '@/services'
import { UsersController } from '@/controllers'
import { registerController } from '@/decorators'
import { config } from '@/config'

export const usersRoutes: ExpressRouter = Router()

const uploadDir = path.join(config.uploads.baseDir, 'profile')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg'
    const userId = (req as any).user?.id || Date.now().toString()
    cb(null, `${userId}${ext}`)
  },
})
const upload = multer({ storage })
const usersService = new UsersService()

usersRoutes.post(
  '/users/profile-image',
  authMiddleware,
  upload.single('file'),
  async (req: any, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Não autenticado',
          error: 'UNAUTHORIZED',
        })
      }
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Arquivo obrigatório',
          error: 'FILE_REQUIRED',
        })
      }
      const relativePath = `/uploads/profile/${req.file.filename}`
      const updated = await usersService.updateProfileImage(
        req.user.id,
        relativePath,
      )
      return res.status(200).json({
        success: true,
        message: 'Imagem atualizada com sucesso',
        data: {
          ...updated,
          profileImageUrl: relativePath,
        },
      })
    } catch (e: any) {
      return res
        .status(500)
        .json({ success: false, message: e.message, error: 'INTERNAL_ERROR' })
    }
  },
)

usersRoutes.delete(
  '/users/profile-image',
  authMiddleware,
  async (req: any, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Não autenticado',
          error: 'UNAUTHORIZED',
        })
      }
      const user = await usersService.getUserById(req.user.id)
      if (user?.profileImageUrl) {
        // Extract the relative path after /uploads/
        const relativePath = user.profileImageUrl.startsWith('/uploads/')
          ? user.profileImageUrl.substring('/uploads/'.length)
          : user.profileImageUrl
        const filePath = path.join(config.uploads.baseDir, relativePath)
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
        }
      }
      const updated = await usersService.updateProfileImage(req.user.id, null)
      return res.status(200).json({
        success: true,
        message: 'Imagem excluída com sucesso',
        data: updated,
      })
    } catch (e: any) {
      console.error('Error deleting profile image:', e)
      return res
        .status(500)
        .json({ success: false, message: e.message, error: 'INTERNAL_ERROR' })
    }
  },
)

export const usersSwaggerPaths = registerController(
  usersRoutes,
  UsersController,
)
