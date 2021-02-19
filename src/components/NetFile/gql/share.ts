import gql from 'graphql-tag';
import { userFile } from '/@/components/NetFile/gql/basic';

//分享文件列表
const driveListShares = gql`
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

//获取分享文件信息
const driveFindShare = gql`
  query($uri: String!, $code: String) {
    driveFindShare(uri: $uri, code: $code) {
      code
      id
      token
      uri
      expiredAt
      ${userFile}
      user{
      id
      }
    }
  }
`;

// 预览分享文件
const drivePreviewShare = gql`
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

// 分享文件
const driveCreateShare = gql`
  mutation($code: String, $userFileId: String!) {
    driveCreateShare(userFileId: $userFileId, code: $code) {
      uri
      token
      code
    }
  }
`;

// 删除分享文件
const driveDeleteShare = gql`
  mutation($id: ID!) {
    driveDeleteShare(id: $id) {
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
};
