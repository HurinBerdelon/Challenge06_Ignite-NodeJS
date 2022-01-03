import { inject, injectable } from "tsyringe";
import { AppError } from "../../../../shared/errors/AppError";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { OperationType } from "../../entities/Statement";
import { Transaction } from "../../entities/Transaction";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { ITransactionsRepository } from "../../repositories/ITransactionsRepository";

interface IRequest {
    sender_id: string
    receiver_id: string
    description: string
    amount: number
}

@injectable()
class MakeTransactionUseCase {

    constructor(
        @inject('TransactionsRepository')
        private transactionsRepository: ITransactionsRepository,
        @inject('StatementsRepository')
        private statementsRepository: IStatementsRepository,
        @inject('UsersRepository')
        private usersRepository: IUsersRepository
    ) { }

    async execute({ sender_id, receiver_id, description, amount }: IRequest): Promise<Transaction> {
        const sender = await this.usersRepository.findById(sender_id)

        if (!sender) {
            throw new AppError('User Sending Transfer does not exists')
        }

        const receiver = await this.usersRepository.findById(receiver_id)

        if (!receiver) {
            throw new AppError('User Receiving Transfer does not exists')
        }

        const sender_balance = await this.statementsRepository.getUserBalance({
            user_id: sender_id,
        })

        if (amount > sender_balance.balance) {
            throw new AppError('User Sending Transfer does not have balance enough for this transactions')
        }

        const transaction = await this.transactionsRepository.create(
            amount,
            description,
            sender_id,
            OperationType.TRANSFER
        )

        await this.statementsRepository.create({
            amount,
            description,
            user_id: sender_id,
            type: OperationType.TRANSFER
        })

        return transaction
    }
}

export { MakeTransactionUseCase }