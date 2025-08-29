type InrBalance = {
    locked: Number,
    available: Number
}

enum Side {
    yes,
    no
}

export type StockBalance = {
    market_id: String,
    side: Side,
    available: Number,
    locked: Number
}

export type UserBalance = {
    inr_balance: InrBalance,
    stock_balance: StockBalance[]
}

