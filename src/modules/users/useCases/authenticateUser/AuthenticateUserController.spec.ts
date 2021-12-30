import request from "supertest";
import { Connection } from "typeorm";
import { app } from "../../../../app";

import createConnection from '../../../../database'

let connection: Connection

describe('Authenticate User Controller', () => {

    beforeAll(async () => {
        connection = await createConnection()
        await connection.runMigrations()
    })

    afterAll(async () => {
        await connection.dropDatabase()
        await connection.close()
    })

    it('should be able to authenticate user', async () => {
        await request(app)
            .post('/api/v1/users')
            .send({
                'name': 'User Name',
                'email': 'user@email.com',
                'password': 'password@123'
            })

        const response = await request(app)
            .post('/api/v1/sessions')
            .send({
                'email': 'user@email.com',
                'password': 'password@123'
            })

        expect(response.status).toBe(200)
    })

    it('should not be able to authenticate an inexistent user', async () => {
        const response = await request(app)
            .post('/api/v1/sessions')
            .send({
                'email': 'user_incorret@email.com',
                'password': 'password@123'
            })

        expect(response.status).toBe(401)
    })

    it('should not be able to authenticate an user with incorrect password', async () => {
        const response = await request(app)
            .post('/api/v1/sessions')
            .send({
                'email': 'user@email.com',
                'password': 'password@incorrect'
            })

        expect(response.status).toBe(401)
    })

})