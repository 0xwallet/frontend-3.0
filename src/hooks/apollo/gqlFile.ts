import gql from 'graphql-tag';
// import { User } from './gqlUser';
// type
// const DriveUserFileInfo = `DriveUserFileInfo {
//   description: String
//   size: String
//   }
// `;
// const DriveSpace = `
//   enum DriveSpace {
//     PRIVATE
//     PUBLIC
//   }
// `;
// const DriveUserFile = `DriveUserFile {
//   fullName: String
//   hash: String
//   id: ID
//   info: ${DriveUserFileInfo}
//   insertedAt: NaiveDateTime
//   isDir: Boolean
//   space: ${DriveSpace}
//   updatedAt: NaiveDateTime
//   user: ${User}
// }`;
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
//分享文件列表
export const driveListShares = gql`
  query {
    driveListShares {
      code
      id
      token
      uri
      expiredAt
      userFile {
        fullName
        hash
        id
        isDir
        space
        info {
          size
          description
        }
      }
    }
  }
`;

//分享文件
export const driveFindShare = gql`
  query($uri: String!, $code: String) {
    driveFindShare(uri: $uri, code: $code) {
      code
      id
      token
      uri
      expiredAt
      userFile {
        fullName
        hash
        id
        isDir
        space
        info {
          size
          description
        }
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
// 批量删除文件
export const driveDeleteFiles = gql`
  mutation($ids: [String]!, $space: Sting!) {
    driveDeleteFiles(ids: $ids, space: $space)
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
// 获取预览token
export const drivePreviewToken = gql`
  mutation {
    drivePreviewToken
  }
`;
// 分享文件
export const driveCreateShare = gql`
  mutation($code: String, $userFileId: String!) {
    driveCreateShare(userFileId: $userFileId, code: $code) {
      uri
      token
      code
    }
  }
`;
// 删除分享文件
export const driveDeleteShare = gql`
  mutation($id: ID!) {
    driveDeleteShare(id: $id) {
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
