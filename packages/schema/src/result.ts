export type TweetDataRepair = {
  path: (string | number)[]
  code:
    | 'defaulted-missing'
    | 'defaulted-null'
    | 'defaulted-invalid'
    | 'derived'
    | 'dropped-invalid-item'
    | 'dropped-invalid-optional'
    | 'discarded-unknown-key'
}

export type RepairedTweet<Data> = {
  data: Data
  repairs: TweetDataRepair[]
}
