import gql from "graphql-tag";
import { userFile } from "./basic";

//发布文件列表
const driveListPublishs = gql`
  query {
    driveListPublishs {
      collectedCount
      isCollected
      current {
        id
        txid
        ${userFile}
        version
      }
       history {
          id
          txid
          version
          ${userFile}
        }
      id
    }
  }
`;

// 发布文件
const driveCreatePublish = gql`
  mutation ($userFileId: String!) {
    driveCreatePublish(userFileId: $userFileId) {
      id
    }
  }
`;

// 删除发布
const driveDeletePublish = gql`
  mutation ($id: ID!) {
    driveDeletePublish(id: $id) {
      id
    }
  }
`;
// 发布文件改变版本
const driveChangePublishVersion = gql`
  mutation ($id: ID!, $publishHistoryId: ID!) {
    driveChangePublishVersion(id: $id, publishHistoryId: $publishHistoryId) {
      id
    }
  }
`;

// 更新文件
const driveUpdatePublish = gql`
  mutation ($userFileId: String!, $id: Sting!) {
    driveUpdatePublish(userFileId: $userFileId, id: $id) {
      id
    }
  }
`;
//发布文件txid
export const driveFindPublish = gql`
  query ($txid:String!){
    driveFindPublish(txid:$txid) {
    id
      current {
        id
        txid
        ${userFile}
        version
      }
      }
  }
`;
export const Publish = {
  List: driveListPublishs,
  Create: driveCreatePublish,
  Delete: driveDeletePublish,
  ChangeVersion: driveChangePublishVersion,
  Update: driveUpdatePublish,
  Find: driveFindPublish,
};
