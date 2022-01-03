import { AppError } from "../../../../shared/errors/AppError"
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { OperationType } from "../../entities/Statement"
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { InMemoryTransactionsRepository } from "../../repositories/in-memory/InMemoryTransactionsRepository"
import { MakeTransactionUseCase } from "./makeTransactionUseCase"


let transactionsRepositoryInMemory: InMemoryTransactionsRepository
let statementsRepositoryInMemory: InMemoryStatementsRepository
let userRepositoryInMemory: InMemoryUsersRepository
let makeTransactionUseCase: MakeTransactionUseCase

describe('Make Transaction', () => {

    beforeEach(() => {
        transactionsRepositoryInMemory = new InMemoryTransactionsRepository()
        statementsRepositoryInMemory = new InMemoryStatementsRepository()
        userRepositoryInMemory = new InMemoryUsersRepository()
        makeTransactionUseCase = new MakeTransactionUseCase(
            transactionsRepositoryInMemory,
            statementsRepositoryInMemory,
            userRepositoryInMemory
        )
    })

    it('should be able to create a new transaction', async () => {
        const sender = await userRepositoryInMemory.create({
            email: 'sender@email.com',
            name: 'Sender Test',
            password: 'sender'
        })

        const receiver = await userRepositoryInMemory.create({
            email: 'receiver@email.com',
            name: 'Receiver Test',
            password: 'receiver'
        })

        await statementsRepositoryInMemory.create({
            amount: 400,
            description: 'Deposit',
            type: OperationType.DEPOSIT,
            user_id: sender.id
        })

        const transaction = await makeTransactionUseCase.execute({
            amount: 400,
            description: 'Transaction',
            sender_id: sender.id,
            receiver_id: receiver.id
        })

        expect(transaction).toHaveProperty('id')
    })

    it('should not be able to create a transactions with an amount bigger than user\'s balance', async () => {
        const sender = await userRepositoryInMemory.create({
            email: 'sender@email.com',
            name: 'Sender Test',
            password: 'sender'
        })

        const receiver = await userRepositoryInMemory.create({
            email: 'receiver@email.com',
            name: 'Receiver Test',
            password: 'receiver'
        })

        await statementsRepositoryInMemory.create({
            amount: 400,
            description: 'Deposit',
            type: OperationType.DEPOSIT,
            user_id: sender.id
        })

        await expect(
            makeTransactionUseCase.execute({
                amount: 500,
                description: 'Transaction',
                sender_id: sender.id,
                receiver_id: receiver.id
            })
        ).rejects.toEqual(new AppError('User Sending Transfer does not have balance enough for this transactions'))
    })

    it('should not be able to create a transactions from a non-existing sender', async () => {

        const receiver = await userRepositoryInMemory.create({
            email: 'receiver@email.com',
            name: 'Receiver Test',
            password: 'receiver'
        })

        await expect(
            makeTransactionUseCase.execute({
                amount: 500,
                description: 'Transaction',
                sender_id: 'not-a-sender-ID',
                receiver_id: receiver.id
            })
        ).rejects.toEqual(new AppError('User Sending Transfer does not exists'))
    })

    it('should not be able to create a transactions for a non-existing receiver', async () => {

        const sender = await userRepositoryInMemory.create({
            email: 'sender@email.com',
            name: 'Sender Test',
            password: 'sender'
        })

        await statementsRepositoryInMemory.create({
            amount: 400,
            description: 'Deposit',
            type: OperationType.DEPOSIT,
            user_id: sender.id
        })

        await expect(
            makeTransactionUseCase.execute({
                amount: 500,
                description: 'Transaction',
                sender_id: sender.id,
                receiver_id: 'non-existing-receiver-id'
            })
        ).rejects.toEqual(new AppError('User Receiving Transfer does not exists'))
    })
})