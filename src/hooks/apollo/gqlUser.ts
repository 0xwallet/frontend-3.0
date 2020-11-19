import gql from 'graphql-tag';

// mutations

// 邮件验证码
export const sendVerifyCode = gql`
  mutation($email: String, $type: VerifyCodeType) {
    sendVerifyCode(email: $email, type: $type)
  }
`;
// 用户结构体
export const User = `
  User {
  id
  avatar
  email
  loginNknAddress
  personalInfo {
    country
    passport
    phoneNumber
  }
  role
  type
}`;
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
      }
    }
  }
`;
