<template>
  <Spin :spinning="spinning">
    <Card hoverable>
      <template #title>
        <BasicTitle>{{ t('profileTitle') }} </BasicTitle>
      </template>
      <template #extra><Switch v-model:checked="edit" @change="editInfo" /></template>
      <CardMeta>
        <template #title>
          <span
            >{{ userInfo.username }}
            <span class="float-right">
              1 BSV = 195.58 USD
              <!--              <a-button type="primary" shape="round" @click="openPWModal">-->
              <!--                Change Password</a-button-->
              <!--              >-->
            </span>
          </span>
        </template>

        <template #avatar>
          <div v-if="edit">
            <Upload
              :beforeUpload="beforeUpload"
              :showUploadList="false"
              accept="image/png, image/jpeg"
            >
              <div class="relative">
                <Avatar :src="`https://drive-s.owaf.io/${avatar}`" :size="64" />
                <p class="absolute bottom-0 left-5 text-white">{{ t('edit') }}</p>
              </div>
            </Upload></div
          >
          <div v-else><Avatar :src="`https://drive-s.owaf.io/${avatar}`" :size="64" /></div>
        </template>
      </CardMeta>
      <Divider />

      <div>
        <div>
          <BasicHelp text="提示" /> How
          <a href="https://nkn.org/" target="_blank"><b>NKN</b></a> Works
        </div>
        <Card hoverable>
          <template class="ant-card-actions" #actions> </template>
          <CardMeta>
            <template #title
              >{{ t('publicKey') }}
              <Tooltip v-if="publicKey !== '' && temp"
                ><template #title> {{ t('temporary') }}</template
                >⚠️</Tooltip
              >
              <span class="float-right" @click="openQr" v-if="publicKey !== '' && !temp"
                ><QrcodeOutlined
              /></span>
            </template>
            <template #description
              >{{ publicKey }}
              <span class="float-right" @click="copyKey" v-if="publicKey !== '' && !temp"
                ><CopyOutlined /></span
            ></template>
          </CardMeta>
          <Divider />

          <Tag :color="status ? '#52c41a' : '#f50'">
            <CheckCircleTwoTone v-if="status" twoToneColor="#52c41a" />
            <QuestionCircleTwoTone v-if="!status" twoToneColor="#f50" />

            {{ status ? t('connected') : t('connecting') }}
            <Icon icon="fa-solid:signal" :size="15" />
          </Tag>
        </Card>
      </div>
      <Divider />
      <Row class="line" :gutter="15">
        <Col :span="8">{{ t('email') }}</Col>
        <Col :span="8">{{ t('country') }}</Col>
        <Col :span="8">Passport</Col>
      </Row>
      <Row class="line strong" :gutter="15">
        <Col :span="8">
          <span v-if="!edit">{{ userInfo.email }}</span>
          <Input v-model:value="userInfo.email" v-if="edit"></Input>
        </Col>
        <Col :span="8">
          <span v-if="!edit">{{ userInfo.country }}</span>
          <Input v-model:value="userInfo.country" v-if="edit"></Input>
        </Col>
        <Col :span="8">
          <span v-if="!edit">{{ userInfo.passport }}</span>
          <Input v-model:value="userInfo.passport" v-if="edit"></Input
        ></Col>
      </Row>
      <Row class="line" :gutter="15">
        <Col :span="8"><CheckOutlined />{{ t('verified') }}</Col>
        <Col :span="8"><CloseOutlined />{{ t('unVerified') }}</Col>
        <Col :span="8"><CloseOutlined />{{ t('unVerified') }}</Col>
      </Row>
      <Divider />
      <Row class="line strong" :gutter="15">
        <Col :span="12">{{ t('name') }}</Col>
        <Col :span="12">{{ t('bio') }}</Col>
      </Row>
      <Row class="line" :gutter="15">
        <Col :span="12">
          <span v-if="!edit">{{ userInfo.username }}</span>
          <Input v-model:value="userInfo.username" v-if="edit"></Input>
        </Col>
        <Col :span="12">
          <span v-if="!edit">{{ userInfo.bio }}</span>
          <Input v-model:value="userInfo.bio" v-if="edit"></Input>
        </Col>
      </Row>
      <Divider />
      <!--      <Row class="line strong" :gutter="15">-->
      <!--        <Col :span="12">0xWallet ID</Col>-->
      <!--      </Row>-->
      <!--      <Row class="line" :gutter="15">-->
      <!--        <Col :span="12">{{ userInfo.username }}</Col>-->
      <!--      </Row>-->
      <!--      <Row class="line" :gutter="15">-->
      <!--        <Col :span="12"> <a-button type="primary" shape="round"> Change My ID</a-button></Col>-->
      <!--      </Row>-->
      <div>
        <div>
          <BasicHelp text="提示" /> How
          <a href="https://id.owaf.org/" target="_blank"><b>0xWallet ID </b></a> Works
        </div>
        <Card hoverable>
          <template class="ant-card-actions" #actions> </template>
          <CardMeta>
            <template #title
              >0xID
              <Tooltip v-if="publicKey !== '' && temp"
                ><template #title> {{ t('temporary') }}</template
                >⚠️</Tooltip
              >
              <span class="float-right" @click="openQr" v-if="publicKey !== '' && !temp"
                ><QrcodeOutlined
              /></span>
            </template>
            <template #description
              >{{ publicKey }}
              <span class="float-right" @click="copyKey" v-if="publicKey !== '' && !temp"
                ><CopyOutlined /></span
            ></template>
          </CardMeta>
          <Divider />
          <div class="grid grid-col-2 grid-flow-col gap-4">
            <div
              ><div class="grid grid-col-2">
                <div>{{ t('totalBalance') }}</div>
                <div>$212.27 USD</div>
                <div>1.085227 BSV </div>
              </div></div
            >
            <div class="flex flex-row-reverse"
              ><div class="rounded-full py-3 px-6 bg-red-500 text-white w-20 h-12 mr-4">{{
                t('walletSend')
              }}</div>
              <div class="rounded-full py-3 px-6 bg-blue-700 text-white w-20 h-12 mr-4">{{
                t('walletAdd')
              }}</div></div
            >
          </div>
        </Card>
      </div>
    </Card>
  </Spin>
  <Modal v-model:visible="visible" :footer="null" centered>
    <template #title>{{ t('contactAddress') }}</template>
    <div class="grid gird-col-1 gap-2 justify-items-center">
      <div>{{ publicKey }}</div>
      <div><QrCode :value="publicKey" /></div>
      <div>{{ t('QrText') }}</div>
    </div>
  </Modal>
  <PWModal @register="registerPWModal" />
</template>

<script lang="ts">
  import { defineComponent, ref, unref, computed, reactive } from 'vue';
  import { BasicTitle, BasicHelp } from '/@/components/Basic';
  import {
    Card,
    Avatar,
    Divider,
    Modal,
    Tag,
    Row,
    Col,
    Switch,
    Input,
    Spin,
    Tooltip,
    Upload,
  } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useWallet } from '/@/hooks/nkn/getNKN';
  import {
    QrcodeOutlined,
    CopyOutlined,
    CheckCircleTwoTone,
    QuestionCircleTwoTone,
    CheckOutlined,
    CloseOutlined,
  } from '@ant-design/icons-vue';
  import { QrCode } from '/@/components/Qrcode';
  import { useCopyToClipboard } from '/@/hooks/web/useCopyToClipboard';
  import { useMessage } from '/@/hooks/web/useMessage';
  import PWModal from './changePWModal.vue';
  import { useModal } from '/@/components/Modal';
  import { userStore } from '/@/store/modules/user';
  import { editCurrentUser, me } from '/@/hooks/apollo/gqlUser';
  import { useMutation, useQuery } from '@vue/apollo-composable';
  import { Icon } from '/@/components/Icon';
  import { Button } from '/@/components/Button';
  import { fileStore } from '/@/store/modules/netFile';

  export default defineComponent({
    components: {
      BasicTitle,
      BasicHelp,
      Tag,
      Card,
      CardMeta: Card.Meta,
      Avatar,
      Divider,
      QrcodeOutlined,
      CopyOutlined,
      Modal,
      QrCode,
      CheckCircleTwoTone,
      QuestionCircleTwoTone,
      CheckOutlined,
      CloseOutlined,
      Row,
      Col,
      PWModal,
      Switch,
      Input,
      Spin,
      Icon,
      Tooltip,
      Button,
      Upload,
    },

    setup() {
      const { t } = useI18n('general.account');
      const avatar = ref('');
      const userInfo = reactive({
        username: '',
        email: '',
        country: '',
        passport: '',
        name: '',
        bio: '',
        avatar: '',
      });
      const spinning = ref(true);
      const publicKey = ref('');
      const visible = ref(false);
      const wallet = ref({});
      const edit = ref(false);
      const status = computed(() => {
        return userStore.userNKNstatus;
      });
      const token = localStorage.getItem('token');
      const temp = ref(false);
      const { clipboardRef, copiedRef } = useCopyToClipboard();
      const { createMessage, createErrorModal } = useMessage();
      const [registerPWModal, { openModal: openPwModal }] = useModal();

      useWallet().then((w) => {
        publicKey.value = w.getPublicKey();
      });

      const { onResult: getMe, refetch } = useQuery(me, null, () => ({
        fetchPolicy: 'network-only',
      }));

      getMe((res) => {
        const { me } = res.data;
        userInfo.username = me.username;
        avatar.value = me.avatar;
        userInfo.email = me.email;
        userInfo.bio = me.bio;
        userInfo.country = me.personalInfo?.country || 'UnKnow';
        userInfo.passport = me.personalInfo?.passport || 'UnKnow';
        me.wallets.forEach((v) => {
          if (v.tags.length > 0) {
            v.tags.forEach((v1) => {
              if (v1 === 'MESSAGE') {
                wallet.value = v;
              }
            });
          }
        });
        spinning.value = false;
      });

      function openQr() {
        visible.value = true;
      }
      function openPWModal() {
        openPwModal(true);
      }
      function copyKey() {
        clipboardRef.value = publicKey.value;
        if (unref(copiedRef)) {
          createMessage.success('copy success！');
        }
      }
      const { mutate: EditUser, onError, onDone } = useMutation(editCurrentUser);
      onError((err) => {
        createErrorModal({ content: err });
      });
      onDone(() => {
        refetch();
      });
      async function editInfo(checked: Boolean) {
        if (!checked) {
          spinning.value = true;
          await EditUser({
            avatar: userInfo.avatar,
            bio: userInfo.bio,
            username: userInfo.username,
            personalInfo: {
              country: userInfo.country,
              passport: userInfo.country,
            },
          });
          spinning.value = false;
        }
      }
      async function changeAvatar() {
        if (!edit.value) return;
      }
      async function beforeUpload(file) {
        await fileStore.uploadAvatar(file);
        setTimeout(() => {
          console.log('刷新');
          refetch();
        }, 3000);

        return false;
        // await NetUpload.checkFile(file, path, true);
      }

      return {
        t,
        userInfo,
        publicKey,
        openQr,
        visible,
        copyKey,
        status,
        openPWModal,
        registerPWModal,
        token,
        edit,
        editInfo,
        spinning,
        temp,
        changeAvatar,
        beforeUpload,
        avatar,
      };
    },
  });
</script>
<style lang="less" scoped>
  .setRight {
    float: right;
  }

  .line {
    margin: 10px;
  }

  .strong {
    font-weight: bold;
  }

  .center {
    margin: auto;
  }
</style>
