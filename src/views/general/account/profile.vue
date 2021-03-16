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
            <span class="setRight"
              ><a-button type="primary" shape="round" @click="openPWModal">
                Change Password</a-button
              ></span
            >
          </span>
        </template>

        <template #avatar>
          <Avatar :src="userInfo.avatar" />
        </template>
      </CardMeta>
      <Divider />
      <div> <BasicHelp text="提示" /> How <b>D-Chat</b> Works </div>
      <Card hoverable>
        <template class="ant-card-actions" #actions> </template>
        <CardMeta>
          <template #title
            >Public Key
            <span class="setRight" @click="openQr" v-if="publicKey !== ''"><QrcodeOutlined /></span>
          </template>
          <template #description
            >{{ publicKey }} <span class="setRight" @click="copyKey"><CopyOutlined /></span
          ></template>
        </CardMeta>
        <Divider />

        <Tag :color="status ? '#52c41a' : '#f50'">
          <CheckCircleTwoTone v-if="status" twoToneColor="#52c41a" />
          <QuestionCircleTwoTone v-if="!status" twoToneColor="#f50" />

          {{ status ? t('connected') : t('connecting') }} Primary NKN Public Address
        </Tag>
      </Card>
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
      <Row class="line strong" :gutter="15">
        <Col :span="12">0xWallet ID</Col>
      </Row>
      <Row class="line" :gutter="15">
        <Col :span="12">{{ userInfo.username }}</Col>
      </Row>
      <Row class="line" :gutter="15">
        <Col :span="12"> <a-button type="primary" shape="round"> Change My ID</a-button></Col>
      </Row>
    </Card>
  </Spin>
  <Modal v-model:visible="visible" :footer="null" centered>
    <Row type="flex" justify="center">
      <Col :span="12"><QrCode :value="publicKey" /></Col>
    </Row>
    <Row type="flex" justify="center">
      <Col :span="12">{{ t('QrText') }}</Col>
    </Row>
  </Modal>
  <PWModal @register="registerPWModal" />
</template>

<script lang="ts">
  import { defineComponent, ref, unref, computed, reactive } from 'vue';
  import { BasicTitle, BasicHelp } from '/@/components/Basic';
  import { Card, Avatar, Divider, Modal, Tag, Row, Col, Switch, Input, Spin } from 'ant-design-vue';
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
    },

    setup() {
      const { t } = useI18n('general.account');
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
      const publicKey = ref('')
      const visible = ref(false);
      const wallet = ref({});
      const edit = ref(false);
      const status = computed(() => {
        return userStore.userNKNstatus;
      });
      const token = localStorage.getItem('token');
      const { clipboardRef, copiedRef } = useCopyToClipboard();
      const { createMessage, createErrorModal } = useMessage();
      const [registerPWModal, { openModal: openPwModal }] = useModal();

      useWallet().then(w=>{
        publicKey.value=w.getPublicKey()
      })


      const { onResult: getMe, refetch } = useQuery(me, null, () => ({
        fetchPolicy: 'network-only',
      }));

      getMe((res) => {
        const { me } = res.data;
        userInfo.username = me.username;
        userInfo.avatar = me.avatar;
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
