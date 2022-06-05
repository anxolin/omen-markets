import { request, gql } from 'graphql-request'
import { getMarketQuery } from './queries'
import axios from 'axios'

const MARKET_SUBGRAPH_URL = 'https://gateway.thegraph.com/api/47e8db8d0f1b4a6c98b190e04f20dcb1/subgraphs/id/0x0503024fcc5e1bd834530e69d592dbb6e8c03968-0'
const IPFS_3BOX_SPACE = 'did%3A3%3Abafyreiejas3ngkhuqdpv46vbcdhhxnfg6ubr5qlofbgz3h2ky55wf6vewa'

const getCommentsUrl = (market: string) => `https://ipfs.3box.io/thread?space=conditional_exchange&name=${market}&mod=${IPFS_3BOX_SPACE}&members=false`

// Ommen Markets (see https://bafybeicoyb2b452djwpe4yfbh4n3pbhyoout2i4xfaqb3mtvq26jjwaa2q.ipfs.dweb.link)
const MARKETS = [
  '0x95b2271039b020aba31b933039e042b60b063800',  // Will Joe Biden win the 2020 United States presidential election? (DAI)
  '0x00031c96aae99eb00376e273e10c82d0ee77305d', // Will Joe Biden win the 2020 United States presidential election? (ETH)
  '0xffbc624070cb014420a6f7547fd05dfe635e2db2', // Will there be a day with at least 1000 reported Corona death in the US in the first 14 days of July?
]



async function getMarketInfo(marketId: string) {
  const market = await request({
    url: MARKET_SUBGRAPH_URL,
    document: getMarketQuery,
    variables: {
      id: marketId
    }
  })

  return market
}


async function getComments(marketId: string) {
  const commentsUrl = getCommentsUrl(marketId)
  return axios.get(commentsUrl)
}

async function main() {
  console.log('Markets', MARKETS)

  const marketId = MARKETS[1]
  // const marketInfo = await getMarketInfo(marketId)
  const comments = await getComments(marketId)

  // console.log('Market info: ', marketInfo)
  console.log('Comments: ', comments)
}

main().catch(console.error)