import type { ApolloClient } from 'apollo-client';
import { NormalizedCacheObject } from 'apollo-cache-inmemory';
import gql from 'graphql-tag';
import type { FetchResult } from 'apollo-link';
import type { Func } from '@/types/base/function';
import type { Account } from '@/types/user/userinfo';
const gqlUser = `User {
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
type MutateReturn<T> = Promise<FetchResult<T>>; 
type signinReq = { password: string; code?: string; loginCode?: string; email: string };
type signupReq = {
  password: string;
  code: string;
  email: string;
  username: string;
  avatar?: string;
};
type sendLoginCodeReq = { email: string; walletId?: string };
type sendVerifyCodeReq = { email: string; type?: string };
type resetPasswordReq = { email: string; oldPassword: string; newPassword: string; code: string };

export default ({ mutate }: ApolloClient<NormalizedCacheObject>): {
  signin: Func;
  signup: Func;
  sendVerifyCode: Func;
  sendLoginCode: Func;
  resetPassword: Func;
} => ({
  signin(params: signinReq):  MutateReturn<Account>{
    console.log(params, 8888);
    return mutate({
      mutation: gql`
        mutation($email: String!, $password: String!, $code: String!) {
          signin(email: $email, password: $password, code: $code) {
            ${gqlUser}
          }
        }
      `,
      variables: params,
      fetchPolicy: 'no-cache',
    });
  },
  signup(params: signupReq):  MutateReturn<Account> {
    return mutate({
      mutation: gql`
        mutation(
          $email: String!
          $username: String!
          $password: String!
          $code: String!
          $avatar: String!
          nknEncryptedWallet: String!
          nknPublicKey: String!
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
            ${gqlUser}
          }
        }
      `,
      variables: params,
    });
  },
  sendVerifyCode(params: sendVerifyCodeReq):  MutateReturn<string> {
    return mutate({
      mutation: gql`
        mutation ($email: String!, $type: VerifyCodeType!) {
          sendVerifyCode(email: $email, type: $type)
        }
      `,
      variables: params,
    });
  },
  sendLoginCode(params: sendLoginCodeReq):  MutateReturn<string> {
    return mutate({
      mutation: gql`
        mutation ($email: String!, $walletId: ID) {
          sendLoginCode(email: $email, walletId: $walletId)
        }
      `,
      variables: params,
    });
  },
  resetPassword(params: resetPasswordReq):  MutateReturn<Account> {
    return mutate({
      mutation: gql`
        mutation ($oldPassword: String!, $newPassword: String!, $email: String!,  $code: String!) {
          resetPassword(oldPassword: $oldPassword, newPassword: $newPassword,email: $email,  code: $code) {
            ${gqlUser}
          }
        }
      `,
      variables: params,
    });
  },
});
