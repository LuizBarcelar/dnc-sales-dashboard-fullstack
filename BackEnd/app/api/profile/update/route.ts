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

export async function PUT(req: Request) {
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
    const { name, phone } = await req.json()

    // 2. Validação dos campos
    if (!name?.trim() || !phone?.trim()) {
      return new Response(JSON.stringify({ error: 'All fields are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // 3. Decodificação do JWT para pegar o ID do usuário logado
    const token = authorization.split(' ')[1] || ''
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number }
    const userId = decoded.userId

    // 4. Conexão com o Banco usando o Pool
    const client = await pool.connect()

    try {
      // Verifica se o usuário existe
      const checkUser = await client.query('SELECT id FROM users WHERE id = $1', [userId]);

      if (checkUser.rows.length === 0) {
        return new Response(JSON.stringify({ error: 'User not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Executa o Update
      await client.query(
        'UPDATE users SET name = $1, phone = $2 WHERE id = $3',
        [name, phone, userId]
      )

      return new Response(JSON.stringify({ message: 'Profile updated' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })

    } finally {
      client.release() // Libera a conexão
    }

  } catch (e) {
    console.error('Erro ao atualizar perfil:', e)
    return new Response(JSON.stringify({ error: 'Failed to update profile' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}