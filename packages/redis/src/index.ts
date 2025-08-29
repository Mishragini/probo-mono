import pkg from "redis";
import type { RedisClientType } from "redis";
import type { queue_req } from "@repo/utils/types"

const { createClient } = pkg;

const redis_url = process.env.REDIS_URL || 'redis://localhost:6379'

export class QueuePublisher {
    private static instance: QueuePublisher
    private publisher: RedisClientType;
    private is_initialised: boolean = false;

    private constructor() {
        this.publisher = createClient({ url: redis_url })
    }

    private async initialise() {
        if (this.is_initialised) return;
        if (!this.publisher.isOpen) {
            await this.publisher.connect()
        }
        this.is_initialised = true;
    }

    public static getInstance() {
        if (!QueuePublisher.instance) {
            QueuePublisher.instance = new QueuePublisher()
        }

        return QueuePublisher.instance;
    }

    public async sendRequest(request: queue_req) {
        if (!this.is_initialised) {
            await this.initialise()
        }
        await this.publisher.lPush('request', JSON.stringify(request))
    }
}

export class QueueConsumer {
    private static instance: QueueConsumer
    private is_initialised: boolean = false;
    private consumer: RedisClientType

    private constructor() {
        this.consumer = createClient({ url: redis_url })
    }

    public static getInstance() {
        if (!QueueConsumer.instance) {
            QueueConsumer.instance = new QueueConsumer()
        }
        return QueueConsumer.instance
    }

    private async initialise() {
        if (this.is_initialised) return
        if (!this.consumer.isOpen) {
            await this.consumer.connect()
        }
        this.is_initialised = true
    }

    public async getReq() {
        if (!this.is_initialised) {
            await this.initialise()
        }
        return this.consumer.rPop("request")
    }
}

export class StreamPublisher {
    private static instance: StreamPublisher;
    private stream_publisher: RedisClientType;
    private is_initialised: boolean = false;

    private constructor() {
        this.stream_publisher = createClient({ url: redis_url })
    }

    private async initialise() {
        if (this.is_initialised) return;

        if (!this.stream_publisher.isOpen) {
            await this.stream_publisher.connect()
        }

        this.is_initialised = true
    }

    public static getInstance() {
        if (!StreamPublisher.instance) {
            StreamPublisher.instance = new StreamPublisher()
        }

        return StreamPublisher.instance
    }

    public async publishToStream(stream_name: string, response: any) {
        if (!this.is_initialised) {
            await this.initialise()
        }

        let request_id = await this.stream_publisher.xAdd(stream_name, "*", {
            response: JSON.stringify(response)
        })

        return request_id
    }
}

export class StreamConsumer {
    private static instance: StreamConsumer;
    private is_initialised: boolean = false;
    private stream_consumer: RedisClientType

    private constructor() {
        this.stream_consumer = createClient({ url: redis_url })
    }

    public static getInstance() {
        if (!StreamConsumer.instance) {
            StreamConsumer.instance = new StreamConsumer()
        }
        return StreamConsumer.instance
    }

    private async initialise() {
        if (this.is_initialised) return;

        if (!this.stream_consumer.isOpen) {
            await this.stream_consumer.connect()
        }

        this.is_initialised = true;
    }

    public async readFromStream(stream_name: string) {
        if (!this.is_initialised) {
            await this.initialise()
        }

        let response = await this.stream_consumer.xRead(
            {
                key: stream_name,
                id: "$"
            },
            {
                COUNT: 1,
                BLOCK: 0
            }
        )

        if (!response) return null;

        let messages = response?.[0]?.messages

        return messages
    }
}