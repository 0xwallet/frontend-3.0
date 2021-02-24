import gql from 'graphql-tag';

export const userFile = `
  userFile {
    fullName
    hash
    id
    isDir
    isShared
    insertedAt
    updatedAt
    space
     user {
        id
      }
    info {
      size
      description
    }
  }
`;

// query
// 文件列表
const driveListFiles = gql`
  query($dirId: String) {
    driveListFiles(dirId: $dirId) {
      id
      fullName
      isDir
      hash
      space
      isShared
      insertedAt
      updatedAt
      info {
        size
        description
      }
      user {
        id
      }
    }
  }
`;
// 新建目录
const driveMakeDir = gql`
  mutation($fullName: [String]!, $description: String) {
    driveMakeDir(fullName: $fullName, description: $description) {
      isDir
      fullName
    }
  }
`;

// 指定目录下新建目录
const driveMakeDirUnder = gql`
  mutation($fullName: String!, $parentId: String!, $description: String) {
    driveMakeDirUnder(name: $fullName, parentId: $parentId, description: $description) {
      isDir
      fullName
    }
  }
`;

// 移动文件到指定ID
const driveMoveFile = gql`
  mutation($fromId: String!, $fromSpace: DriveSpace!, $toId: String!, $toSpace: DriveSpace!) {
    driveMoveFile(fromId: $fromId, fromSpace: $fromSpace, toId: $toId, toSpace: $toSpace)
  }
`;

// 删除文件
const driveDeleteFile = gql`
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
const driveUploadByHash = gql`
  mutation($fullName: [String]!, $hash: Sting!) {
    driveUploadByHash(fullName: $fullName, hash: $hash) {
      id
    }
  }
`;
// 获取预览token
const drivePreviewToken = gql`
  mutation {
    drivePreviewToken
  }
`;

// 编辑文件desc
const driveEditDescription = gql`
  mutation($description: String!, $userFileId: Sting!) {
    driveEditDescription(description: $description, userFileId: $userFileId) {
      info {
        description
      }
    }
  }
`;
// 重命名
const driveRenameFile = gql`
  mutation($id: String!, $newName: Sting!, $space: DriveSpace!) {
    driveRenameFile(id: $id, newName: $newName, space: $space) {
      id
    }
  }
`;
// 复制文件
const driveCopyFile = gql`
  mutation($fromId: String!, $toId: String!) {
    driveCopyFile(fromId: $fromId, toId: $toId)
  }
`;
export const Basic = {
  FileList: driveListFiles,
  MakeDir: driveMakeDir,
  MakeDirUnder: driveMakeDirUnder,
  Move: driveMoveFile,
  Delete: driveDeleteFile,
  DeleteFiles: driveDeleteFiles,
  Hash: driveUploadByHash,
  Token: drivePreviewToken,
  Desc: driveEditDescription,
  Rename: driveRenameFile,
  Copy: driveCopyFile,
};
