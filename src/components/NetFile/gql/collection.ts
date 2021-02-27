import gql from 'graphql-tag';
import { userFile } from '/@/components/NetFile/gql/basic';
//发布文件列表
const driveListCollections = gql`
  query {
    driveListCollections {
      id
      info {
        description
      }
      insertedAt
      updatedAt
      item {
        ... on DriveShare {
          shareID: id
          ${userFile}
          expiredAt
        }

        ... on DrivePublish {
          publishID: id
        }
      }
    }
  }
`;

const driveCreatePublishCollection = gql`
  mutation($id: ID!, $desc: String) {
    driveCreatePublishCollection(publishId: $id, description: $desc) {
      id
    }
  }
`;

const driveCreateShareCollection = gql`
  mutation($id: ID!, $desc: String, $code: String) {
    driveCreateShareCollection(shareId: $id, description: $desc, code: $code) {
      id
    }
  }
`;

const driveDelectCollection = gql`
  mutation($id: ID!) {
    driveDelectCollection(id: $id) {
      id
    }
  }
`;

export const Collection = {
  List: driveListCollections,
  CreatePublish: driveCreatePublishCollection,
  CreateShare: driveCreateShareCollection,
  Delete: driveDelectCollection,
};