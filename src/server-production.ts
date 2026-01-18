import 'reflect-metadata'
import { createApp } from './app'
import { Express, Request, Response } from 'express'

let appInstance: Express | null = null

async function getApp(): Promise<Express> {
  if (appInstance) {
    return appInstance
  }

  try {
    const app = await createApp()
    appInstance = app
    return appInstance
  } catch (error) {
    console.error('Erro ao iniciar o servidor:', error)
    throw error
  }
}

export default async (req: Request, res: Response) => {
  const app = await getApp()
  return app(req, res)
}
