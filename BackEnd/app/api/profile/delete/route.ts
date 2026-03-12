import { headers } from 'next/headers'
import jwt from 'jsonwebtoken'
import { Pool } from 'pg'

// Configuração da conexão universal (pg)
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export async function DELETE() {
  const headersList = headers()
  const authorization = headersList.get('Authorization')

  // 1. Verificação do Token
  if (!authorization) {
    return new Response(JSON.stringify({ error: 'Authorization must be provided' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    // 2. Decodificação do JWT para garantir que o usuário só delete a si mesmo
    const token = authorization.split(' ')[1] || ''
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number }
    const userId = decoded.userId

    // 3. Conexão com o Banco usando o Pool
    const client = await pool.connect()

    try {
      // Executa o Delete na tabela 'users'
      const result = await client.query('DELETE FROM users WHERE id = $1', [userId]);

      if (result.rowCount === 0) {
        return new Response(JSON.stringify({ error: 'User not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({ message: 'Profile deleted' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })

    } finally {
      client.release() // Libera a conexão para o pool
    }

  } catch (e) {
    console.error('Erro ao deletar perfil:', e)
    return new Response(JSON.stringify({ error: 'Failed to delete profile' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}