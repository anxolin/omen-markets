import { request, gql } from 'graphql-request'
import { getMarketQuery } from './queries'
import axios from 'axios'
// import { DID } from 'dids'
import fs from 'fs'
import path from 'path'

// import { getResolver } from '@ceramicnetwork/3id-did-resolver'
/* eslint-disable @typescript-eslint/no-var-requires */
const Box = require('3box')
// const { Resolver } = require('did-resolver')
// const { getResolver } = require('3id-resolver')


// Ommen Markets (see https://bafybeicoyb2b452djwpe4yfbh4n3pbhyoout2i4xfaqb3mtvq26jjwaa2q.ipfs.dweb.link)
const MARKETS = [
  '0x95b2271039b020aba31b933039e042b60b063800',  // Will Joe Biden win the 2020 United States presidential election? (DAI)
  '0x00031c96aae99eb00376e273e10c82d0ee77305d', // Will Joe Biden win the 2020 United States presidential election? (ETH)
  '0xffbc624070cb014420a6f7547fd05dfe635e2db2', // Will there be a day with at least 1000 reported Corona death in the US in the first 14 days of July?
]
const MARKET_SUBGRAPH_URL = 'https://gateway.thegraph.com/api/47e8db8d0f1b4a6c98b190e04f20dcb1/subgraphs/id/0x0503024fcc5e1bd834530e69d592dbb6e8c03968-0'
const DATA_DIR = path.join(__dirname, '../data')

// 3box
const IPFS_3BOX_SPACE = 'did%3A3%3Abafyreiejas3ngkhuqdpv46vbcdhhxnfg6ubr5qlofbgz3h2ky55wf6vewa'
const THREEBOX_SPACE = 'conditional_exchange'
// const THREEBOX_ADMIN_ADDRESS = '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1'
// const THREEBOX_SPACE_NAME = 'conditional_exchange'

// https://ipfs.3box.io/did-doc?cid=bafyreigicekttsomarz5uzhn3gu4zpivixnoslaxoq7h3jlxu4x7mqmfn4
const getCommentsUrl = (market: string) => `https://ipfs.3box.io/thread?space=${THREEBOX_SPACE}&name=${market}&mod=${IPFS_3BOX_SPACE}&members=false`
const getDidDocumentUrl = (id: string) => `https://ipfs.3box.io/did-doc?cid=${id}`

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

async function getEnhancedComments(comments: any) {

  const enhancedComments = []
  for (const comment of comments) {
    const { timestamp, author, ...other } = comment
    const profile = await getProfile(author)
    const did = await getDid(author)
    const ethereumAddress = did.publicKey[2].ethereumAddress

    enhancedComments.push({
      ...other,
      timestamp,
      author,
      profile: profile,
      did,
      ethereumAddress,
      date: (new Date(timestamp * 1000)).toISOString()
    })
  }

  return enhancedComments
}

async function getComments(marketId: string) {
  const commentsFile = `markets/${marketId}/comments.json`
  let comments = getData(commentsFile)

  if (!comments) {
    console.log(`Get Comments from API (ID = ${marketId})`)
    const apiUrl = getCommentsUrl(marketId)
    const commentsRaw = (await axios.get(apiUrl)).data
    comments = await getEnhancedComments(commentsRaw)
    console.log(`Write Comments in: data/${commentsFile}`)
    writeData(commentsFile, comments)
  } else {
    console.log(`Get Comments from Cache: data/${commentsFile}`)
  }


  return comments
}


async function getProfile(key: string) {
  const profileFile = `profiles/${key}.json`
  let profile = getData(profileFile)

  if (!profile) {
    console.log(`Get profile from 3Box (DID = ${key})`)
    profile = await Box.getProfile(key)
    console.log(`Write Profile in: data/${profileFile}`)
    writeData(profileFile, profile)
  }

  return profile
}


/**
 *  I had to create my own getDid method, because the resolver get stucked.
 */
async function getDidAux(key: string) {
  const urlDid = getDidDocumentUrl(key.split(':')[2])
  const mainDoc = (await axios.get(urlDid)).data.value

  const urlRoot = getDidDocumentUrl(mainDoc.root.split(':')[2])
  const rootDoc = (await axios.get(urlRoot)).data.value

  return {
    ...mainDoc,
    ...rootDoc,
    publicKey: rootDoc.publicKey.concat(mainDoc.publicKey)
  }
}


async function getDid(key: string) {
  const didFile = `dids/${key}.json`
  let didDoc = getData(didFile)

  if (!didDoc) {
    console.log(`Get DID document (DID = ${key})`)
    
    // FIXME: It gets stuck sometimes!
    // didDoc = await resolver.resolve(key)
    didDoc = await getDidAux(key)


    console.log(`Write DID Document in: data/${didFile}`)
    writeData(didFile, didDoc)
  }

  return didDoc
}

async function main() {
  // const ipfs = await Box.getIPFS();
  // resolver = new Resolver(getResolver(ipfs));

  for (const marketId of MARKETS) {
    console.log()
    const marketInfo = await getMarketInfo(marketId)
    console.log(`Market ${marketId} resolved: ${marketInfo.fixedProductMarketMaker.title}`)

    const comments = await getComments(marketId)
    console.log(`Retrieved ${comments.length} comments for Market ${marketId}`)  
  }

  console.log('Success 💪')
  process.exit()
}

main().catch(console.error)