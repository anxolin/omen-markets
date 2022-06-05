import { request, gql } from 'graphql-request'


const SUBGRAPH_URL = 'https://gateway.thegraph.com/api/47e8db8d0f1b4a6c98b190e04f20dcb1/subgraphs/id/0x0503024fcc5e1bd834530e69d592dbb6e8c03968-0'

const MARKETS = [
  '0x95b2271039b020aba31b933039e042b60b063800',  // Will Joe Biden win the 2020 United States presidential election? (DAI)
  '0x00031c96aae99eb00376e273e10c82d0ee77305d', // Will Joe Biden win the 2020 United States presidential election? (ETH)
  '0xffbc624070cb014420a6f7547fd05dfe635e2db2', // Will there be a day with at least 1000 reported Corona death in the US in the first 14 days of July?
]

// GetMarket
// 0x00031c96aae99eb00376e273e10c82d0ee77305d

const query = gql`
  query GetMarket($id: ID!) {
    fixedProductMarketMaker(id: $id) {
      id
      title
      outcomes
      creator
      lastActiveDay
      creationTimestamp
      openingTimestamp
      resolutionTimestamp
      question {
        id
        data
        currentAnswer
        answers {
          answer
          bondAggregate
        }
      }
    }
  }
`

async function fetchMarketInfo(marketId: string) {
  const market = await request({
    url: SUBGRAPH_URL,
    document: query,
    variables: {
      id: marketId
    }
  })

  return market
}

async function main() {
  console.log('Markets', MARKETS)

  const marketId = MARKETS[0]
  const marketInfo = await fetchMarketInfo(marketId)

  console.log('Market info: ', marketInfo)
}

main().catch(console.error)