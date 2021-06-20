import gql from "graphql-tag";

const userFile = `
  userFile {
    fullName
    hash
    id
    isDir
    isShared
    insertedAt
    updatedAt
    space
    user{
    id
    driveSetting {
          availableSpace
          totalSpace
          usedSpace
        }
    }
    info {
      size
      description
    }
  }
`;
//分享文件列表
const driveListShares = gql`
  query {
    driveListShares {
      code
      id
      token
      uri
      expiredAt
      collectedCount
      isCollected
      insertedAt
      updatedAt
      ${userFile}
    }
  }
`;

//获取分享文件信息
const driveFindShare = gql`
  query($uri: String!, $code: String) {
    driveFindShare(uri: $uri, code: $code) {
      code
      id
      token
      uri
      expiredAt
      collectedCount
      ${userFile}
      user{
      id
      }
    }
  }
`;

// 预览分享文件
const drivePreviewShare = gql`
  query ($uri: String!) {
    drivePreviewShare(uri: $uri) {
      needCode
      expiredAt
      insertedAt
      updatedAt
      UserPreview {
        avatar
        bio
        email
        username
      }
    }
  }
`;

// 分享文件
const driveCreateShare = gql`
  mutation ($code: String, $userFileId: String!, $day: Int) {
    driveCreateShare(
      userFileId: $userFileId
      code: $code
      expiredAfterDays: $day
    ) {
      uri
      token
      code
    }
  }
`;

// 删除分享文件
const driveDeleteShare = gql`
  mutation ($id: ID!) {
    driveDeleteShare(id: $id) {
      id
    }
  }
`;

// 删除分享文件
const driveEditShare = gql`
  mutation ($id: ID!, $code: String, $expiredAt: Int) {
    driveEditShare(id: $id, expiredAfterDays: $expiredAt, code: $code) {
      id
    }
  }
`;

export const Share = {
  List: driveListShares,
  Find: driveFindShare,
  Preview: drivePreviewShare,
  Create: driveCreateShare,
  Delete: driveDeleteShare,
  Edit: driveEditShare,
};
