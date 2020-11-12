import { useApollo } from '@/hooks/api/graphql';
import { ActionContext } from 'vuex';
import { UserStore, RootStore } from '@/types/store';
import { createWallet } from '@/hooks/nkn/useWallet';
import { useMessage } from '@/hooks/web/useMessage';

type UserContext = ActionContext<UserStore, RootStore>;

const { notification } = useMessage();
export default {
    namespaced: true,
    state: {
      userInfo: null
    },
    mutations: {
      SET_USERINFO (state: UserStore, payload: any) {
        state.userInfo = payload;
      }
    },
    actions: {
        async login ({ commit }: UserContext, params: { password: string; email: string }) {
          createWallet(params);
          const userInfo = await useApollo().user.signin(params);
          notification.success({
            message: '注册成功',
            description: `欢迎回来: ${userInfo.realName}`,
            duration: 3,
          });
          commit('SET_USERINFO', userInfo);
        },
        async register ({ commit }: UserContext, params: { password: string; email: string; code: string; username: string }) {
          const { nknEncryptedWallet, nknPublicKey } = createWallet(params);
          const userInfo = await useApollo().user.signup({...params, nknEncryptedWallet, nknPublicKey});
          notification.success({
            message: '注册成功',
            description: `欢迎回来: ${userInfo.realName}`,
            duration: 3,
          });
          commit('SET_USERINFO', userInfo);
        }
    }
};