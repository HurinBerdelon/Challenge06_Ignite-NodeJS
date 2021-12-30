import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase"
import { OperationType } from "../../entities/Statement"
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { CreateStatementError } from "./CreateStatementError"
import { CreateStatementUseCase } from "./CreateStatementUseCase"

let statementsRepositoryInMemory: InMemoryStatementsRepository
let usersRepositoryInMemory: InMemoryUsersRepository
let createStatementUseCase: CreateStatementUseCase
let createUserUseCase: CreateUserUseCase


describe('Create Statement', () => {

    beforeEach(() => {
        usersRepositoryInMemory = new InMemoryUsersRepository()
        statementsRepositoryInMemory = new InMemoryStatementsRepository()
        createStatementUseCase = new CreateStatementUseCase(usersRepositoryInMemory, statementsRepositoryInMemory)
        createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory)
    })

    it('should be able to create a new statement', async () => {
        const user = await createUserUseCase.execute({
            name: 'Name Test',
            email: 'User@test.com',
            password: 'password@123'
        })

        const statement = await createStatementUseCase.execute({
            user_id: user.id,
            type: OperationType.DEPOSIT,
            amount: 500,
            description: 'Deposit Description'
        })

        expect(statement).toHaveProperty('id')
    })

    it('should not be able to create a new statement for a inexistent user', async () => {
        expect(async () => {
            await createStatementUseCase.execute({
                user_id: 'inexistent_id',
                type: OperationType.DEPOSIT,
                amount: 500,
                description: 'Deposit Description'
            })
        }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound)
    })

    it('should not be able to create a new withdraw statement with insufficient funds', async () => {
        expect(async () => {

            const user = await createUserUseCase.execute({
                name: 'Name Test',
                email: 'User@test.com',
                password: 'password@123'
            })

            await createStatementUseCase.execute({
                user_id: user.id,
                type: OperationType.WITHDRAW,
                amount: 500,
                description: 'Deposit Description'
            })
        }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds)
    })
})