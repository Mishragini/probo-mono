import { UserBalance, StockBalance } from './types/inMemoryDb'
import { StreamPublisher } from '@repo/redis/index'
import { queue_req } from "@repo/utils/types"


export class Engine {
    private static instance: Engine;
    private stream_publisher: StreamPublisher
    private userBalanceMap: Map<String, UserBalance>

    private constructor() {
        this.userBalanceMap = new Map()
        this.stream_publisher = StreamPublisher.getInstance()
    }

    public static getInstance() {
        if (!Engine.instance) {
            Engine.instance = new Engine()
        }
        return Engine.instance
    }

    private async handleSignup(payload: { user_id: string, reply_to: string }) {
        let { user_id, reply_to } = payload
        try {
            let inr_balance = {
                locked: 0,
                available: 0
            }
            let stock_balance: StockBalance[] = []
            let new_user_balance: UserBalance = {
                inr_balance,
                stock_balance
            }

            this.userBalanceMap.set(user_id, new_user_balance) // ✅ fixed

            let response = {
                success: true,
                message: 'User added in the engine successfully',
                user_id
            }

            this.stream_publisher.publishToStream(reply_to, response)
        } catch (error) {
            let response = {
                success: false,
                message: 'Failed to add user in the engine'
            }
            this.stream_publisher.publishToStream(reply_to, response)
        }
    }


    public async handleReq(request: queue_req) {
        switch (request.type) {
            case 'signup':
                this.handleSignup(request.data)
                break;

            default:
                break;
        }
    }

}