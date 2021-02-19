import gql from 'graphql-tag';

// subscriptions
export const driveFileUploaded = gql`
  subscription($userId: ID!) {
    driveFileUploaded(userId: $userId) {
      id
      fullName
      isDir
    }
  }
`;
