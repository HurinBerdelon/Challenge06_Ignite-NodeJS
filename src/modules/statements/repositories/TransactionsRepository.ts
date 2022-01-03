import { getRepository, Repository } from "typeorm";
import { OperationType } from "../entities/Statement";
import { Transaction } from "../entities/Transaction";
import { ITransactionsRepository } from "./ITransactionsRepository";

class TransactionsRepository implements ITransactionsRepository {

    private repository: Repository<Transaction>

    constructor() {
        this.repository = getRepository(Transaction)
    }

    async create(amount: number, description: string, sender_id: string, type: OperationType): Promise<Transaction> {
        const transaction = this.repository.create({
            sender_id,
            amount,
            description,
            type
        });

        return this.repository.save(transaction);
    }
    async findBySenderId(sender_id: string): Promise<Transaction[]> {
        const transactions = await this.repository.find({
            where: {
                sender_id: sender_id
            }
        })

        return transactions
    }
}

export { TransactionsRepository }