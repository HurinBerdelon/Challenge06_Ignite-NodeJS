import request from 'supertest'
import { Connection } from 'typeorm'
import { app } from '../../../../app'

import createConnection from '../../../../database'

let connection: Connection

describe('Create Statement Controller', () => {

    beforeAll(async () => {
        connection = await createConnection()
        await connection.runMigrations()

        await request(app)
            .post('/api/v1/users')
            .send({
                'name': 'userTest',
                'email': 'user@test.com',
                'password': 'test@test'
            })
    })

    afterAll(async () => {
        await connection.dropDatabase()
        await connection.close()
    })

    it('should be able to create a new deposit statement', async () => {
        const responseToken = await request(app)
            .post('/api/v1/sessions')
            .send({
                'email': 'user@test.com',
                'password': 'test@test'
            })

        const { token } = responseToken.body

        const response = await request(app)
            .post('/api/v1/statements/deposit')
            .set({
                Authorization: `Bearer ${token}`
            })
            .send({
                'amount': 500,
                'description': 'Deposit Test'
            })

        expect(response.status).toBe(201)
    })

    it('should be able to create a new withdraw statement', async () => {
        const responseToken = await request(app)
            .post('/api/v1/sessions')
            .send({
                'email': 'user@test.com',
                'password': 'test@test'
            })

        const { token } = responseToken.body

        const response = await request(app)
            .post('/api/v1/statements/withdraw')
            .set({
                Authorization: `Bearer ${token}`
            })
            .send({
                'amount': 300,
                'description': 'Withdraw Test'
            })

        expect(response.status).toBe(201)
    })

    it('should not be able to create a new statement for a inexistent user', async () => {
        const response = await request(app)
            .post('/api/v1/statements/withdraw')
            .set({
                Authorization: `Bearer ${'wrong-token'}`
            })
            .send({
                'amount': 300,
                'description': 'Withdraw Test'
            })

        expect(response.status).toBe(401)
    })

})