import gql from 'graphql-tag';
// 用户结构体
export const User = `
  id
  avatar
  username
  bio
  email
  loginNknAddress
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
  encryptedWallet
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
// 修改密码
export const resetPassword = gql`
  mutation($email: String!, $newPassword: String!, $oldPassword: String = "") {
    resetPassword(email: $email, newPassword: $newPassword, oldPassword: $oldPassword) {
      token
      User {
        id
      }
    }
  }
`;

// 邮件验证码
export const sendVerifyCode = gql`
  mutation($email: String, $type: VerifyCodeType) {
    sendVerifyCode(email: $email, type: $type)
  }
`;

// 用户注册
export const signUp = gql`
  mutation(
    $email: String!
    $username: String!
    $password: String!
    $code: String!
    $avatar: String
    $nknEncryptedWallet: String!
    $nknPublicKey: String!
  ) {
    signup(
      email: $email
      password: $password
      code: $code
      username: $username
      avatar: $avatar
      nknEncryptedWallet: $nknEncryptedWallet
      nknPublicKey: $nknPublicKey
    ) {
      ${User}
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
          info {
            encryptedWallet
          }
        }
      }
    }
  }
`;

export const bindNknAddress = gql`
  mutation bindNknAddress(
    $code: String
    $encryptedWallet: String
    $nknPublicKey: String
    $tag: WalletTag
    $password: String!
  ) {
    bindNknAddress(
      code: $code
      encryptedWallet: $encryptedWallet
      nknPublicKey: $nknPublicKey
      tag: $tag
      password: $password
    ) {
      id
    }
  }
`;
