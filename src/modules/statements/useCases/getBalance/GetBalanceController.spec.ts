import request from 'supertest'
import { Connection } from 'typeorm'
import { app } from '../../../../app'

import createConnection from '../../../../database'

let connection: Connection


describe('Get Balance Controller', () => {

    beforeAll(async () => {
        connection = await createConnection()
        await connection.runMigrations()

        // Create User
        await request(app)
            .post('/api/v1/users')
            .send({
                'name': 'userTest',
                'email': 'user@test.com',
                'password': 'test@test'
            })

        // Authenticate User
        const responseToken = await request(app)
            .post('/api/v1/sessions')
            .send({
                'email': 'user@test.com',
                'password': 'test@test'
            })

        const { token } = responseToken.body

        // Create a new statement
        await request(app)
            .post('/api/v1/statements/deposit')
            .set({
                Authorization: `Bearer ${token}`
            })
            .send({
                'amount': 500,
                'description': 'Deposit Test'
            })

    })

    afterAll(async () => {
        await connection.dropDatabase()
        await connection.close()
    })

    it('should be able to get balance for a user', async () => {
        // Authenticate User
        const responseToken = await request(app)
            .post('/api/v1/sessions')
            .send({
                'email': 'user@test.com',
                'password': 'test@test'
            })

        const { token } = responseToken.body

        const response = await request(app)
            .get('/api/v1/statements/balance')
            .set({
                Authorization: `Bearer ${token}`
            })

        expect(response.status).toBe(200)
    })

    it('should not be able to get balance for a inexistent user', async () => {
        const response = await request(app)
            .get('/api/v1/statements/balance')
            .set({
                Authorization: `Bearer ${'invalid-token'}`
            })

        expect(response.status).toBe(401)
    })

})