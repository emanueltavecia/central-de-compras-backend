import { database } from './src/database/connection'

async function testConnection() {
  try {
    const isConnected = await database.testConnection()
    if (isConnected) {
      console.log('Database connection successful!')
    } else {
      console.log('Database connection failed!')
    }
  } catch (error) {
    console.error('Connection test failed:', error)
  } finally {
    await database.close()
  }
}

testConnection()
