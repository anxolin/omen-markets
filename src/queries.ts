import { gql } from 'graphql-request'

// export const getMarketQuery = gql`
//   query GetMarket($id: ID!) {
//     fixedProductMarketMaker(id: $id) {
//       id
//       title
//       outcomes
//       creator
//       lastActiveDay
//       creationTimestamp
//       openingTimestamp
//       resolutionTimestamp
//       question {
//         id
//         data
//         currentAnswer
//         answers {
//           answer
//           bondAggregate
//         }
//       }
//     }
//   }
// `

export const getMarketQuery = gql`
query GetMarket($id: ID!) {
  fixedProductMarketMaker(id: $id) {
    id
    creator
    collateralToken
    fee
    collateralVolume
    outcomeTokenAmounts
    outcomeTokenMarginalPrices
    condition {
      id
      payouts
      oracle
      __typename
    }
    templateId
    title
    outcomes
    category
    language
    lastActiveDay
    runningDailyVolume
    arbitrator
    creationTimestamp
    openingTimestamp
    timeout
    resolutionTimestamp
    currentAnswer
    currentAnswerTimestamp
    currentAnswerBond
    answerFinalizedTimestamp
    scaledLiquidityParameter
    runningDailyVolumeByHour
    isPendingArbitration
    arbitrationOccurred
    runningDailyVolumeByHour
    curatedByDxDao
    curatedByDxDaoOrKleros
    question {
      id
      data
      currentAnswer
      answers {
        answer
        bondAggregate
        __typename
      }
      __typename
    }
    klerosTCRregistered
    curatedByDxDaoOrKleros
    curatedByDxDao
    submissionIDs {
      id
      status
      __typename
    }
    scalarLow
    scalarHigh
    __typename
  }
}
`


export const getQuestion = gql`
{
  query GetQuestion($id: ID!) {
    question(id: $id) {
      indexedFixedProductMarketMakers {
        id
        collateralToken
      }
    }
  }
}
`