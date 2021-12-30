import request from 'supertest'
import { Connection } from 'typeorm'
import { app } from '../../../../app'

import createConnection from '../../../../database'

let connection: Connection


describe('Get Statement Operation Controller', () => {

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
    })

    afterAll(async () => {
        await connection.dropDatabase()
        await connection.close()
    })

    it('should be able to get a statement operation', async () => {
        // Authenticate User
        const responseToken = await request(app)
            .post('/api/v1/sessions')
            .send({
                'email': 'user@test.com',
                'password': 'test@test'
            })

        const { token } = responseToken.body

        // Create a new statement
        const responseStatement = await request(app)
            .post('/api/v1/statements/deposit')
            .set({
                Authorization: `Bearer ${token}`
            })
            .send({
                'amount': 500,
                'description': 'Deposit Test'
            })

        const statementOperation = responseStatement.body

        const response = await request(app)
            .get(`/api/v1/statements/${statementOperation.id}`)
            .set({
                Authorization: `Bearer ${token}`
            })
            .send()

        expect(response.status).toBe(200)
    })

    it('should not be able to get a inexistent statement operation', async () => {
        // Authenticate User
        const responseToken = await request(app)
            .post('/api/v1/sessions')
            .send({
                'email': 'user@test.com',
                'password': 'test@test'
            })

        const { token } = responseToken.body

        const invalidID = '8b096e20-6994-11ec-90d6-0242ac120003'

        const response = await request(app)
            .get(`/api/v1/statements/${invalidID}`)
            .set({
                Authorization: `Bearer ${token}`
            })
            .send({
                amount: 100,
                description: "deposit description",
            })

        expect(response.status).toBe(404)
    })

    it('should not be able to get a statement operation from an inexistent user', async () => {
        // Authenticate User
        const responseToken = await request(app)
            .post('/api/v1/sessions')
            .send({
                'email': 'user@test.com',
                'password': 'test@test'
            })

        const { token } = responseToken.body

        // Create a new statement
        const responseStatement = await request(app)
            .post('/api/v1/statements/deposit')
            .set({
                Authorization: `Bearer ${token}`
            })
            .send({
                'amount': 500,
                'description': 'Deposit Test'
            })

        const statementOperation = responseStatement.body

        const response = await request(app)
            .get(`/api/v1/statements/${statementOperation}`)
            .send({
                'amount': 500,
                'description': 'Deposit Test'
            })

        expect(response.status).toBe(401)
    })
})