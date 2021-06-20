import gql from "graphql-tag";
// 用户结构体
export const User = `
  id
  avatar
  username
  bio
  email
  messageNknAddress
  personalInfo {
    country
    passport
    phoneNumber
  }
  wallets{
  id
  tags
  info{
  publicKey
  }
  }
  role
  type
`;
//query
export const me = gql`
  query {
    me{
    ${User}
    }
  }
`;

// mutations

// 邮件验证码
export const sendVerifyCode = gql`
  mutation ($email: String, $type: VerifyCodeType, $nkn: String) {
    sendVerifyCode(email: $email, type: $type, nkn: $nkn)
  }
`;

// 用户注册
export const signUp = gql`
  mutation signup(
    $email: String!
    $username: String!
    $password: String!
    $code: String!
    $avatar: String
    $nknPublicKey: String!
  ) {
    signup(
      email: $email
      password: $password
      code: $code
      username: $username
      avatar: $avatar
      nknPublicKey: $nknPublicKey
    ) {
      token
    }
  }
`;
// 用户登录
export const signIn = gql`
  mutation signin($email: String!, $password: String!, $code: String!) {
    signin(email: $email, password: $password, code: $code) {
      token
      User {
        id
        wallets {
          tags
        }
        username
      }
    }
  }
`;

export const bindNknAddress = gql`
  mutation bindNknAddress(
    $code: String
    $nknPublicKey: String
    $tag: WalletTag
    $password: String!
  ) {
    bindNknAddress(
      code: $code
      nknPublicKey: $nknPublicKey
      tag: $tag
      password: $password
    ) {
      id
    }
  }
`;

export const editCurrentUser = gql`
  mutation editCurrentUser(
    $avatar: String
    $bio: String
    $code: String
    $username: String
    $personalInfo: PersonalInfoInput
  ) {
    editCurrentUser(
      avatar: $avatar
      bio: $bio
      code: $code
      username: $username
      personalInfo: $personalInfo
    ) {
      id
    }
  }
`;
//修改密码
export const resetPassword = gql`
  mutation resetPassword(
    $code: String
    $email: String!
    $newPassword: String!
    $oldPassword: String
  ) {
    resetPassword(
      code: $code
      email: $email
      newPassword: $newPassword
      oldPassword: $oldPassword
    ) {
      token
    }
  }
`;
//绑定NKN device
export const nknOnline = gql`
  mutation nknOnline($nknPublicKey: String!) {
    nknOnline(nknPublicKey: $nknPublicKey) {
      id
    }
  }
`;
//绑定NKN device
export const bindNknSecurityDevice = gql`
  mutation bindNknSecurityDevice(
    $code: String!
    $nknPublicKey: String!
    $password: String!
  ) {
    bindNknSecurityDevice(
      code: $code
      nknPublicKey: $nknPublicKey
      password: $password
    ) {
      id
    }
  }
`;
export const sendLoginCode = gql`
  mutation sendLoginCode($email: String!) {
    sendLoginCode(email: $email)
  }
`;
