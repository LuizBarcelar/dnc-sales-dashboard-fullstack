import bcrypt from 'bcryptjs'
import { Pool } from 'pg';

// Configuração da conexão universal (pg)
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export async function POST(request: Request) {
    
    const { name, email, phone, password } = await request.json()

    // Validação básica
    if (!name?.trim() || !email?.trim() || !phone?.trim() || !password?.trim()) {
      return new Response(JSON.stringify({ error: 'All fields are required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
      })
    }

    // AQUI ESTÁ A MUDANÇA: Usamos o pool.connect() em vez de db.connect()
    const client = await pool.connect()

    try {
        // 1. Verifica se o e-mail já existe
        const emailCheckResult = await client.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );

        if (emailCheckResult.rows.length > 0) {
            return new Response(JSON.stringify({ error: 'Email is already in use' }), {
                status: 409,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 2. Criptografa a senha
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Insere o novo usuário
        const result = await client.query(
            'INSERT INTO users (name, email, phone, password) VALUES ($1, $2, $3, $4) RETURNING id',
            [name, email, phone, hashedPassword]
        );

        const userId = result.rows[0].id;

        return new Response(JSON.stringify({ id: userId }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err) {
        console.error('Erro no Banco de Dados:', err); // Log para você ver no terminal
        return new Response(JSON.stringify({ error: 'Failed to create user' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        })
    } finally {
        // Libera a conexão para o pool
        client.release();
    }
}