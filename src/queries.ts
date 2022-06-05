import { gql } from 'graphql-request'

export const getMarketQuery = gql`
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