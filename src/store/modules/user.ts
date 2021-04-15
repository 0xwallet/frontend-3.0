import type { UserInfo } from '/#/store';

import { defineStore } from 'pinia';
import { store } from '/@/store';

import { RoleEnum } from '/@/enums/roleEnum';
import { PageEnum } from '/@/enums/pageEnum';
import { ROLES_KEY, TOKEN_KEY, USER_INFO_KEY } from '/@/enums/cacheEnum';

import { getAuthCache, setAuthCache } from '/@/utils/auth';
import {
  GetUserInfoByUserIdModel,
} from '/@/api/sys/model/userModel';
import { disk } from '/@/hooks/nkn/getNKN';

import { useI18n } from '/@/hooks/web/useI18n';
import { useMessage } from '/@/hooks/web/useMessage';
import router from '/@/router';

interface UserState {
  userInfo: Nullable<UserInfo>;
  token?: string;
  roleList: RoleEnum[];
  nknStatus:boolean
}

export const useUserStore = defineStore({
  id: 'app-user',
  state: (): UserState => ({
    // user info
    userInfo: null,
    // token
    token: undefined,
    // roleList
    roleList: [],
    nknStatus:false
  }),
  getters: {
    getUserInfo(): UserInfo {
      return this.userInfo || getAuthCache<UserInfo>(USER_INFO_KEY) || {};
    },
    getToken(): string {
      return this.token || getAuthCache<string>(TOKEN_KEY);
    },
    getRoleList(): RoleEnum[] {
      return this.roleList.length > 0 ? this.roleList : getAuthCache<RoleEnum[]>(ROLES_KEY);
    },
  },
  actions: {
    checkNKN(): void {
      setInterval(() => {
        if (disk) {
          this.nknStatus=true;
        } else {
          this.nknStatus=false;
        }
      }, 1000);
    },
    setToken(info: string) {
      this.token = info;
      setAuthCache(TOKEN_KEY, info);
    },
    setRoleList(roleList: RoleEnum[]) {
      this.roleList = roleList;
      setAuthCache(ROLES_KEY, roleList);
    },
    setUserInfo(info: UserInfo) {
      this.userInfo = info;
      setAuthCache(USER_INFO_KEY, info);
    },
    resetState() {
      this.userInfo = null;
      this.token = '';
      this.roleList = [];
    },
    /**
     * @description: login
     */
    async login(
    ): Promise<GetUserInfoByUserIdModel | null> {
      try {


        // save token
        this.setToken('1');
        this.setRoleList(['super'] as RoleEnum[]);
        // get user info

        await router.replace(PageEnum.BASE_HOME)
        return null;
      } catch (error) {
        return null;
      }
    },
    // async getUserInfoAction({ userId }: GetUserInfoByUserIdParams) {
    //   const userInfo = await getUserInfoById({ userId });
    //   const { roles } = userInfo;
    //   const roleList = roles.map((item) => item.value) as RoleEnum[];
    //   this.setUserInfo(userInfo);
    //   this.setRoleList(roleList);
    //   return userInfo;
    // },
    /**
     * @description: logout
     */
    logout(goLogin = false) {
      goLogin && router.push(PageEnum.BASE_LOGIN);
    },

    /**
     * @description: Confirm before logging out
     */
    confirmLoginOut() {
      const { createConfirm } = useMessage();
      const { t } = useI18n();
      createConfirm({
        iconType: 'warning',
        title: t('sys.app.logoutTip'),
        content: t('sys.app.logoutMessage'),
        onOk: async () => {
          await this.logout(true);
        },
      });
    },
  },
});

// Need to be used outside the setup
export function useUserStoreWidthOut() {
  return useUserStore(store);
}
