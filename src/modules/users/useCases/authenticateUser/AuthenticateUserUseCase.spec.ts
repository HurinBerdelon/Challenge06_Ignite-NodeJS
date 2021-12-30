import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "../createUser/CreateUserUseCase"
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase"
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError"

let userRepositoryInMemory: InMemoryUsersRepository
let createUserUseCase: CreateUserUseCase
let authenticateUserUseCase: AuthenticateUserUseCase

describe('Authenticate User', () => {

    beforeEach(() => {
        userRepositoryInMemory = new InMemoryUsersRepository()
        createUserUseCase = new CreateUserUseCase(userRepositoryInMemory)
        authenticateUserUseCase = new AuthenticateUserUseCase(userRepositoryInMemory)
    })

    it('should be able to authenticate user', async () => {

        const user = await createUserUseCase.execute({
            name: 'User Test',
            email: 'User@test.com',
            password: '123@test'
        })

        const { user: userAuth, token } = await authenticateUserUseCase.execute({ email: 'User@test.com', password: '123@test' })

        expect(userAuth).toHaveProperty('id')
        expect(token).not.toBe(null)
    })

    it('should not be able to authenticate user with incorrect email', async () => {
        expect(async () => {
            const user = await createUserUseCase.execute({
                name: 'User Test',
                email: 'User@test.com',
                password: '123@test'
            })

            const { user: userAuth, token } = await authenticateUserUseCase.execute({ email: 'UserIncorrect@test.com', password: '123@test' })
        }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
    })

    it('should not be able to authenticate user with incorrect password', async () => {
        expect(async () => {
            const user = await createUserUseCase.execute({
                name: 'User Test',
                email: 'User@test.com',
                password: '123@test'
            })

            const { user: userAuth, token } = await authenticateUserUseCase.execute({ email: 'User@test.com', password: '123@incorrect' })
        }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
    })

})