import request from 'supertest'
import { Connection } from 'typeorm'
import { app } from '../../../../app'

import createConnection from '../../../../database'

let connection: Connection

describe('Create Transaction', () => {

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

    it('should be able to create a new transaction', async () => {
        const responseToken = await request(app)
            .post('/api/v1/sessions')
            .send({
                'email': 'user@test.com',
                'password': 'test@test'
            })

        const { token } = responseToken.body

        const receiver_user = await request(app)
            .post('/api/v1/users')
            .send({
                'name': 'ReceiverTest',
                'email': 'receiver@test.com',
                'password': 'test@test'
            })

        await request(app)
            .post('/api/v1/statements/deposit')
            .set({
                Authorization: `Bearer ${token}`
            })
            .send({
                description: 'Deposit',
                amount: 500
            })

        const response = await request(app)
            .post(`/api/v1/statements/transfer/${receiver_user.body.id}`)
            .set({
                Authorization: `Bearer ${token}`
            })
            .send({
                description: 'Transfer',
                amount: 400
            })

        expect(response.status).toBe(201)
    })

    it('should not be able to create a new transaction for a non authenticated user', async () => {

        const responseToken = await request(app)
            .post('/session')
            .send({
                'email': 'user@test.com',
                'password': 'test@test'
            })

        const { token } = responseToken.body

        const receiver_user = await request(app)
            .post('/api/v1/users')
            .send({
                'name': 'ReceiverTest',
                'email': 'receiver@test.com',
                'password': 'test@test'
            })

        await request(app)
            .post('/api/v1/statements/deposit')
            .set({
                Authorization: `Bearer ${token}`
            })
            .send({
                description: 'Deposit',
                amount: 500
            })

        const response = await request(app)
            .post(`/api/v1/transfer/:${receiver_user.body.id}`)
            .send({
                description: 'Transfer',
                amount: 400
            })

        expect(response.status).toBe(404)
    })
})