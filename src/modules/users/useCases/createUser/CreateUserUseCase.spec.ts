import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { CreateUserError } from "./CreateUserError"
import { CreateUserUseCase } from "./CreateUserUseCase"

let userRepositoryInMemory: InMemoryUsersRepository
let createUserUseCase: CreateUserUseCase

describe('Create User', () => {

    beforeEach(() => {
        userRepositoryInMemory = new InMemoryUsersRepository()
        createUserUseCase = new CreateUserUseCase(userRepositoryInMemory)
    })

    it('should be able to create a new user', async () => {
        const user = {
            name: 'User Test',
            email: 'User@test.com',
            password: '123@test'
        }

        const userCreated = await createUserUseCase.execute(user)

        expect(userCreated).toHaveProperty('id')
    })

    it('should not be able to create a new user with an existing email', async () => {
        expect(async () => {
            const user = {
                name: 'User Test',
                email: 'User@test.com',
                password: '123@test'
            }

            await createUserUseCase.execute(user)
            await createUserUseCase.execute(user)
        }).rejects.toBeInstanceOf(CreateUserError)
    })

})