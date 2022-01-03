import { OperationType } from "../../entities/Statement";
import { Transaction } from "../../entities/Transaction";
import { ITransactionsRepository } from "../ITransactionsRepository";

export class InMemoryTransactionsRepository implements ITransactionsRepository {

    private transactions: Transaction[] = []

    async create(amount: number, description: string, sender_id: string, type: OperationType): Promise<Transaction> {
        const transaction = new Transaction()

        Object.assign(transaction, {
            amount,
            description,
            sender_id,
            type
        })

        this.transactions.push(transaction)

        return transaction
    }
    async findBySenderId(sender_id: string): Promise<Transaction[]> {
        return this.transactions.filter(transaction => transaction.sender_id === sender_id)
    }

}