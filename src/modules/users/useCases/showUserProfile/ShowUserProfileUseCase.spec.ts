import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "../createUser/CreateUserUseCase"
import { ShowUserProfileError } from "./ShowUserProfileError"
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase"

let userRepositoryInMemory: InMemoryUsersRepository
let createUserUseCase: CreateUserUseCase
let showProfileUseCase: ShowUserProfileUseCase

describe('Authenticate User', () => {

    beforeEach(() => {
        userRepositoryInMemory = new InMemoryUsersRepository()
        createUserUseCase = new CreateUserUseCase(userRepositoryInMemory)
        showProfileUseCase = new ShowUserProfileUseCase(userRepositoryInMemory)
    })

    it('should be able to show user\'s profile', async () => {

        const user = await createUserUseCase.execute({
            name: 'User Test',
            email: 'User@test.com',
            password: '123@test'
        })

        const userProfile = await showProfileUseCase.execute(user.id)

        expect(userProfile).toHaveProperty('id')
    })

    it('should not be able to show a profile of a inexisting user', async () => {

        expect(async () => {
            const userProfile = await showProfileUseCase.execute('non_existing_id')
        }).rejects.toBeInstanceOf(ShowUserProfileError)
    })
})