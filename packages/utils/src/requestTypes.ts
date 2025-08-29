type signup_req = {
    type: "signup",
    data: {
        user_id: string,
        reply_to: string
    }
}


export type queue_req = signup_req