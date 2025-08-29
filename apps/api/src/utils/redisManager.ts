import { QueuePublisher, StreamConsumer } from "@repo/redis/index"
import { queue_req } from "@repo/utils/types"

export class RedisManager {
    private static instance: RedisManager
    public stream_name: string
    private queue_publisher: QueuePublisher
    private stream_consumer: StreamConsumer

    private constructor() {
        this.queue_publisher = QueuePublisher.getInstance()
        this.stream_consumer = StreamConsumer.getInstance()
        let api_id = crypto.randomUUID()
        this.stream_name = `api:${api_id}`
    }

    public static getInstance() {
        if (!RedisManager.instance) {
            RedisManager.instance = new RedisManager()
        }
        return RedisManager.instance
    }


    public async sendAndAwait(request_payload: queue_req) {
        try {
            await this.queue_publisher.sendRequest(request_payload)
            let stream_response = await this.stream_consumer.readFromStream(this.stream_name)
            return stream_response;

        } catch (error) {
            throw new Error(error instanceof Error ? error?.message : "Something went wrong...")
        }
    }
}