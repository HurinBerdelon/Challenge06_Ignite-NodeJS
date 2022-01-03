import { OperationType } from "../entities/Statement";
import { Transaction } from "../entities/Transaction";

export interface ITransactionsRepository {
    create(amount: number, description: string, sender_id: string, type: OperationType): Promise<Transaction>
    findBySenderId(sender_id: string): Promise<Transaction[]>
}