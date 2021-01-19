import gql from 'graphql-tag';

const userFile = `
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
`;

// query
// 文件列表
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
      ${userFile}
    }
  }
`;
//发布文件列表
export const driveListPublishs = gql`
  query {
    driveListPublishs {
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

//分享文件
export const driveFindShare = gql`
  query($uri: String!, $code: String) {
    driveFindShare(uri: $uri, code: $code) {
      code
      id
      token
      uri
      expiredAt
      ${userFile}
    }
  }
`;
// 预览分享文件
export const drivePreviewShare = gql`
  query($uri: String!) {
    drivePreviewShare(uri: $uri) {
      needCode
      UserPreview {
        avatar
        bio
        email
        username
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
// 移动文件到指定ID
export const driveMoveFile = gql`
  mutation($fromId: String!, $fromSpace: DriveSpace!, $toId: String!, $toSpace: DriveSpace!) {
    driveMoveFile(fromId: $fromId, fromSpace: $fromSpace, toId: $toId, toSpace: $toSpace)
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
// 发布文件
export const driveCreatePublish = gql`
  mutation($userFileId: String!) {
    driveCreatePublish(userFileId: $userFileId) {
      id
    }
  }
`;

export const driveDeletePublish = gql`
  mutation($id: ID!) {
    driveDeletePublish(id: $id) {
      id
    }
  }
`;
// 发布文件改变版本
export const driveChangePublishVersion = gql`
  mutation($id: ID!, $publishHistoryId: ID!) {
    driveChangePublishVersion(id: $id, publishHistoryId: $publishHistoryId) {
      id
    }
  }
`;

// 发布文件
export const driveUpdatePublish = gql`
  mutation($userFileId: String!, $id: Sting!) {
    driveUpdatePublish(userFileId: $userFileId, id: $id) {
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
