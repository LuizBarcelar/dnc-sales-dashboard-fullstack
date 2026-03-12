import { headers } from 'next/headers'
import { format } from 'date-fns';
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
});

export async function GET() {
    const headersList = headers()
    const authorization = headersList.get('Authorization')

    if (!authorization) return new Response(JSON.stringify({ error: 'Authorization must be provided' }), {
        status: 401,
        headers: {
            'Content-Type': 'application/json'
        }
    })

    const token = authorization?.split(' ')[1] || ''
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number }

    const userId = decoded.userId

    const client = await pool.connect()

    try {
        const result = await client.query('SELECT * FROM users WHERE id = $1', [userId])

        if (result.rows.length === 0) {
            return new Response(JSON.stringify({ error: 'User not found' }), {
                status: 401,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        const value1 = parseFloat((Math.random() * 100000).toFixed(2))
        const value2 = parseFloat((Math.random() * 100000).toFixed(2))
        const getFormattedDate = () => {
            return format(new Date(), "'Atualizado em' dd/MM/yyyy 'às' HH:mm");
        }
        const formatSubtitleStatus = () => {
            if (value1 > value2) return 'success'
            else if (value1 < value2 * 0.6) return 'alert'
            else if (value1 < value2 * 0.99) return 'warning'
            else return 'success'
        } 

        const highlightsResponse = [
            { value: value1, subtitle: getFormattedDate() }, 
            { value: value2, subtitle: formatSubtitleStatus() }, 
            { value: 2.123, subtitle: 'Clique aqui para gerenciar seus leads' }
        ];
        
        return new Response(JSON.stringify(highlightsResponse), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        })
    } catch (e) {
        return new Response(`${e}`, {
            status: 500,
        })
    } finally {
        client.release()
    }
}