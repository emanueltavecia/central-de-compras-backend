import 'reflect-metadata'
import { createApp, config } from './app'

function start() {
  try {
    const app = createApp()

    app.listen(config.server.port, config.server.host, () => {
      console.log(
        `Servidor rodando em http://${config.server.host}:${config.server.port}`,
      )
      console.log(
        `Documentação disponível em http://${config.server.host}:${config.server.port}/docs`,
      )
    })
  } catch (error) {
    console.error('Erro ao iniciar o servidor:', error)
    process.exit(1)
  }
}

start()
