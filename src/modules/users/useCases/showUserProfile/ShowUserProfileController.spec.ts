import { hash } from 'bcryptjs'
import { v4 as uuid } from 'uuid'
import request from 'supertest'
import { Connection } from 'typeorm'
import { app } from '../../../../app'
import createConnection from '../../../../database'

let connection: Connection

describe('Show User Profile Controller', () => {

    beforeAll(async () => {
        connection = await createConnection()
        await connection.runMigrations()

        await request(app)
            .post('/api/v1/users')
            .send({
                'name': 'User Name',
                'email': 'user@email.com',
                'password': 'password@123'
            })
    })

    afterAll(async () => {
        await connection.dropDatabase()
        await connection.close()
    })

    it('should be able to show user profile', async () => {

        const responseToken = await request(app)
            .post('/api/v1/sessions')
            .send({
                'email': 'user@email.com',
                'password': 'password@123'
            })

        const { token } = responseToken.body

        const response = await request(app)
            .get('/api/v1/profile')
            .set({
                Authorization: `Bearer ${token}`,
            })
        expect(response.status).toBe(200)
    })

    it('should not be able to show user profile without authentication', async () => {
        const response = await request(app)
            .get('/api/v1/profile')

        expect(response.status).toBe(401)
    })

    it('should not be able to show user profile with wrong authentication token', async () => {
        const response = await request(app)
            .get('/api/v1/profile')
            .set({
                Authorization: `Bearer ${'token-wrong'}`,
            })
        expect(response.status).toBe(401)
    })
})