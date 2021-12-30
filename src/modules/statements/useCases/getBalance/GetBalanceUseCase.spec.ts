import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase"
import { OperationType } from "../../entities/Statement"
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase"
import { GetBalanceError } from "./GetBalanceError"
import { GetBalanceUseCase } from "./GetBalanceUseCase"

let statementsRepositoryInMemory: InMemoryStatementsRepository
let usersRepositoryInMemory: InMemoryUsersRepository
let createStatementUseCase: CreateStatementUseCase
let createUserUseCase: CreateUserUseCase
let getBalanceUseCase: GetBalanceUseCase


describe('Create Statement', () => {

    beforeEach(() => {
        usersRepositoryInMemory = new InMemoryUsersRepository()
        statementsRepositoryInMemory = new InMemoryStatementsRepository()
        getBalanceUseCase = new GetBalanceUseCase(statementsRepositoryInMemory, usersRepositoryInMemory)
        createStatementUseCase = new CreateStatementUseCase(usersRepositoryInMemory, statementsRepositoryInMemory)
        createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory)
    })

    it('should be able to get user\'s balance', async () => {
        const user = await createUserUseCase.execute({
            name: 'Name Test',
            email: 'User@test.com',
            password: 'password@123'
        })

        await createStatementUseCase.execute({
            user_id: user.id,
            type: OperationType.DEPOSIT,
            amount: 500,
            description: 'Deposit Description'
        })

        await createStatementUseCase.execute({
            user_id: user.id,
            type: OperationType.WITHDRAW,
            amount: 200,
            description: 'Withdraw Description'
        })

        const balance = await getBalanceUseCase.execute({ user_id: user.id })

        expect(balance.balance).toBe(300)
    })

    it('should not be able to get balance for an inexistent user', async () => {

        expect(async () => {
            await getBalanceUseCase.execute({ user_id: 'inexistent_id' })
        }).rejects.toBeInstanceOf(GetBalanceError)
    })

})