import 'reflect-metadata'
import { createApp, config } from './app'

async function start() {
  try {
    const app = await createApp()

    await app.listen({
      port: config.server.port,
      host: config.server.host,
    })

    console.log(
      `Servidor rodando em http://${config.server.host}:${config.server.port}`,
    )
    console.log(
      `Documentação disponível em http://${config.server.host}:${config.server.port}/docs`,
    )
  } catch (error) {
    console.error('Erro ao iniciar o servidor:', error)
    process.exit(1)
  }
}

start()
