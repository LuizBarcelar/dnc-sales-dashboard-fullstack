import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Configuração do Pool de conexão com o Banco
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // 1. Busca o usuário no banco pelo e-mail
    const result = await pool.query('SELECT id, password FROM users WHERE email = $1', [email]);

    // Verificação: Se o usuário não existe ou a senha não bate, retornamos o mesmo erro 401
    // Isso evita que invasores saibam se o e-mail existe ou não no seu banco.
    if (result.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Invalid credentials!' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const user = result.rows[0];

    // 2. Compara a senha digitada com o Hash do banco de forma segura
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return new Response(JSON.stringify({ error: 'Invalid credentials!' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 3. Gera o Token JWT assinado
    const token = jwt.sign(
      { userId: user.id }, 
      process.env.JWT_SECRET as string, 
      { expiresIn: '2h' }
    );

    return new Response(JSON.stringify({ jwt_token: token }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    });

  } catch (e) {
    // Mantemos este log para monitorar falhas críticas (ex: banco fora do ar)
    console.error('🔥 Erro Crítico no Servidor:', e);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}