interface fileParams {
  userFile: userFile;
  shareId?: string;
  code?: string;
  uri?: string;
  token?: string;
  expiredAt?: string;
}

interface userFile {
  fullName: string[];
  hash: string;
  id: string;
  info: { size: string; description: string };
  isDir: boolean;
  space: string;
}

export class file {
  id: string;
  name: string;
  path: string[];
  type: string;
  isDir: boolean;
  fullName: string[];
  size: number;
  hash?: string;
  shareId?: string;
  code?: string;
  expiredAt?: string;
  uri?: string;
  token?: string;
  space: string;
  desc: string;

  constructor(params: fileParams) {
    this.id = params.userFile.id;
    this.fullName = params.userFile.fullName;
    const path = params.userFile.fullName[params.userFile.fullName.length - 1];
    this.isDir = params.userFile.isDir;
    this.space = params.userFile.space;
    if (params.userFile.isDir) {
      this.type = 'folder';
      this.name = path;
    } else {
      this.name = path.split('.')[0];
      this.type = path.split('.')[1];
    }
    this.path = params.userFile.fullName.slice(0, params.userFile.fullName.length - 1);
    this.size = Number(params.userFile.info.size);
    this.desc = params.userFile.info.description;
    this.code = params.code;
    this.token = params.token;
    this.uri = params.uri;
    this.expiredAt = params.expiredAt;
    this.hash = params.userFile.hash;
  }
}
