import { request, gql } from 'graphql-request'
import { getMarketQuery } from './queries'
import axios from 'axios'
// import { DID } from 'dids'
import fs from 'fs'
import path from 'path'

// import { getResolver } from '@ceramicnetwork/3id-did-resolver'
// const Box = require('3box')


// Ommen Markets (see https://bafybeicoyb2b452djwpe4yfbh4n3pbhyoout2i4xfaqb3mtvq26jjwaa2q.ipfs.dweb.link)
const MARKETS = [
  '0x95b2271039b020aba31b933039e042b60b063800',  // Will Joe Biden win the 2020 United States presidential election? (DAI)
  '0x00031c96aae99eb00376e273e10c82d0ee77305d', // Will Joe Biden win the 2020 United States presidential election? (ETH)
  '0xffbc624070cb014420a6f7547fd05dfe635e2db2', // Will there be a day with at least 1000 reported Corona death in the US in the first 14 days of July?
]
const MARKET_SUBGRAPH_URL = 'https://gateway.thegraph.com/api/47e8db8d0f1b4a6c98b190e04f20dcb1/subgraphs/id/0x0503024fcc5e1bd834530e69d592dbb6e8c03968-0'
const IPFS_3BOX_SPACE = 'did%3A3%3Abafyreiejas3ngkhuqdpv46vbcdhhxnfg6ubr5qlofbgz3h2ky55wf6vewa'
const DATA_DIR = path.join(__dirname, '../data')

// const did = new DID({ resolver: getResolver() })


const getCommentsUrl = (market: string) => `https://ipfs.3box.io/thread?space=conditional_exchange&name=${market}&mod=${IPFS_3BOX_SPACE}&members=false`

function getData(dataPath: string) {
  const fullPath = path.join(DATA_DIR, dataPath)

  if (!fs.existsSync(fullPath)) {
    return undefined
  }

  const content = fs.readFileSync(fullPath, 'utf-8')
  return JSON.parse(content.toString())
}

function writeData(dataPath: string, json: any) {
  const fullPath = path.join(DATA_DIR, dataPath)
  fs.mkdirSync(path.join(fullPath, '..'), { recursive: true })
  fs.writeFileSync(fullPath, JSON.stringify(json, null, 2))
}

async function getMarketInfo(marketId: string) {
  const marketFile = `markets/${marketId}/info.json`
  let market = getData(marketFile)

  if (!market) {
    console.log(`Get Market Information from Subgraph (ID = ${marketId})`)
    market = await request({
      url: MARKET_SUBGRAPH_URL,
      document: getMarketQuery,
      variables: {
        id: marketId
      }
    })
    
    console.log(`Write Market Information in: data/${marketFile}`)
    writeData(marketFile, market)
  } else {
    console.log(`Get Market Information from Cache: data/${marketFile}`)
  }


  return market
}


async function getComments(marketId: string) {
  const commentsFile = `markets/${marketId}/comments.json`
  console.log('comments', commentsFile)
  let comments = getData(commentsFile)

  if (!comments) {
    const apiUrl = getCommentsUrl(marketId)
    comments = (await axios.get(apiUrl)).data
    console.log(`Write Comments in: data/${commentsFile}`)
    writeData(commentsFile, comments)
  }


  return comments
}

// async function getDid(key: string) {
//   const profile = await Box.getProfile(key)
  
//   return profile
// }


async function main() {
  for (let marketId of MARKETS) {
    console.log()
    const marketInfo = await getMarketInfo(marketId)
    console.log(`Market ${marketId} resolved: ${marketInfo.fixedProductMarketMaker.title}`)

    const comments = await getComments(marketId)
    console.log(`Retrieved ${comments.length} comments for Market ${marketId}`)
  
    // const did = await getDid('did:3:bafyreiclhtkmlorrnlja6ggcyilhrxh3v5kvlk76u5rjsqukgyq24grmya')
    // console.log('did', did)
  
    // console.log('Comments: ', comments)
  }
}

main().catch(console.error)