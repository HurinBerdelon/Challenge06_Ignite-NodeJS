import { Request, Response } from "express";
import { container } from "tsyringe";
import { MakeTransactionUseCase } from "./makeTransactionUseCase";

export class MakeTransactionController {
    async handle(request: Request, response: Response): Promise<Response> {

        const { id: user_id } = request.user
        const { receiver_id } = request.params
        const { amount, description } = request.body


        const makeTransactionsUseCase = container.resolve(MakeTransactionUseCase)

        const transaction = await makeTransactionsUseCase.execute({
            amount,
            description,
            sender_id: user_id,
            receiver_id
        })

        return response.status(201).json(transaction)
    }
}

