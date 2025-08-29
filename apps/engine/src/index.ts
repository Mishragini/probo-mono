import { QueueConsumer } from "@repo/redis/index"
import { Engine } from "./engine"

async function main() {

    let queue_client = QueueConsumer.getInstance()

    while (true) {
        try {
            let req = await queue_client.getReq()
            if (req) {
                let parsed_req = JSON.parse(req)
                let engine = Engine.getInstance()
                await engine.handleReq(parsed_req)
            }
        } catch (error) {
            //how should we ideally handle this????
            console.error("Error while processing the req", error)
            continue;
        }
    }

}

main().catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
})