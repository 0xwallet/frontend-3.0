import gql from 'graphql-tag';
import { User } from './gqlUser';
// type
const DriveUserFileInfo = `DriveUserFileInfo {
  description: String
  size: String
  }
`;
const DriveSpace = `
  enum DriveSpace {
    PRIVATE
    PUBLIC
  }
`;
const DriveUserFile = `DriveUserFile {
  fullName: String
  hash: String
  id: ID
  info: ${DriveUserFileInfo}
  insertedAt: NaiveDateTime
  isDir: Boolean
  space: ${DriveSpace}
  updatedAt: NaiveDateTime
  user: ${User}
}`;
// query
// 文件查询
export const driveListFiles = gql`
  query($dirId: String) {
    driveListFiles(dirId: $dirId) {
      id
      fullName
      isDir
      hash
      space
      insertedAt
      updatedAt
      info {
        size
        description
      }
    }
  }
`;

// mutations
// 新建目录
export const driveMakeDir = gql`
  mutation($fullName: [String]!) {
    driveMakeDir(fullName: $fullName) {
      isDir
      fullName
    }
  }
`;
// 指定目录下新建目录
export const driveMakeDirUnder = gql`
  mutation($fullName: String!, $parentId: String!) {
    driveMakeDirUnder(name: $fullName, parentId: $parentId) {
      isDir
      fullName
    }
  }
`;
// 指定目录下新建目录
export const driveMoveFile = gql`
  mutation($fromId: String!, $toId: String!) {
    driveMoveFile(fromId: $fromId, toId: $toId)
  }
`;
// 删除文件
export const driveDeleteFile = gql`
  mutation($id: String!, $space: Sting!) {
    driveDeleteFile(id: $id, space: $space)
  }
`;
// 根据hash查询
export const driveUploadByHash = gql`
  mutation($fullName: [String]!, $hash: Sting!) {
    driveUploadByHash(fullName: $fullName, hash: $hash) {
      id
    }
  }
`;

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
