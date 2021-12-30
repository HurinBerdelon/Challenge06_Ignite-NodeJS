import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase"
import { OperationType, Statement } from "../../entities/Statement"
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase"
import { GetStatementOperationError } from "./GetStatementOperationError"
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase"

let statementsRepositoryInMemory: InMemoryStatementsRepository
let usersRepositoryInMemory: InMemoryUsersRepository
let createStatementUseCase: CreateStatementUseCase
let createUserUseCase: CreateUserUseCase
let getStatementOperationUseCase: GetStatementOperationUseCase

describe('Create Statement', () => {

    beforeEach(() => {
        usersRepositoryInMemory = new InMemoryUsersRepository()
        statementsRepositoryInMemory = new InMemoryStatementsRepository()
        getStatementOperationUseCase = new GetStatementOperationUseCase(usersRepositoryInMemory, statementsRepositoryInMemory)
        createStatementUseCase = new CreateStatementUseCase(usersRepositoryInMemory, statementsRepositoryInMemory)
        createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory)
    })

    it('should be able to get a statement operation', async () => {
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

        const operation = await getStatementOperationUseCase.execute({
            user_id: user.id,
            statement_id: statement.id
        })

        expect(operation).toBeInstanceOf(Statement)
    })



    it('should not be able to get a statement operation for a inexistent user', async () => {
        expect(async () => {
            await getStatementOperationUseCase.execute({
                user_id: 'inexistent_user_id',
                statement_id: 'inexistent_statement_id'
            })
        }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound)
    })

    it('should not be able to get a statement operation for a inexistent operation', async () => {
        expect(async () => {
            const user = await createUserUseCase.execute({
                name: 'Name Test',
                email: 'User@test.com',
                password: 'password@123'
            })

            await getStatementOperationUseCase.execute({
                user_id: user.id,
                statement_id: 'inexistent_statement_id'
            })
        }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound)
    })
})
