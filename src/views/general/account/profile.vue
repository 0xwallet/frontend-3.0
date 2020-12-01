<template>
  <Card hoverable>
    <template #title>
      <BasicTitle>{{ t('profileTitle') }}</BasicTitle>
    </template>

    <CardMeta :title="userInfo.username">
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
    <Row class="line">
      <Col :span="8">{{ t('email') }}</Col>
      <Col :span="8">{{ t('country') }}</Col>
      <Col :span="8">Passport</Col>
    </Row>
    <Row class="line strong">
      <Col :span="8">{{ userInfo.email }}</Col>
      <Col :span="8">{{ userInfo.personalInfo?.country || 'UnKnow' }}</Col>
      <Col :span="8">{{ userInfo.personalInfo?.passport || 'UnKnow' }}</Col>
    </Row>
    <Row class="line">
      <Col :span="8"><CheckOutlined />{{ t('verified') }}</Col>
      <Col :span="8"><CloseOutlined />{{ t('unVerified') }}</Col>
      <Col :span="8"><CloseOutlined />{{ t('unVerified') }}</Col>
    </Row>
    <Divider />
    <Row class="line strong">
      <Col :span="12">{{ t('name') }}</Col>
      <Col :span="12">{{ t('bio') }}</Col>
    </Row>
    <Row class="line">
      <Col :span="12">{{ userInfo.username }}</Col>
      <Col :span="12">{{ userInfo.bio }}</Col>
    </Row>
    <Divider />
    <Row class="line strong">
      <Col :span="12">0xWallet ID</Col>
      <Col :span="12">Password</Col>
    </Row>
    <Row class="line">
      <Col :span="12">{{ userInfo.username }}</Col>
      <Col :span="12"> {{ token }}</Col>
    </Row>
    <Row class="line">
      <Col :span="12"> <a-button type="primary" shape="round"> Change My ID</a-button></Col>

      <Col :span="12"
        ><a-button type="primary" shape="round" @click="openPWModal">
          Change Password</a-button
        ></Col
      >
    </Row>
  </Card>
  <Modal v-model:visible="visible" :footer="null">
    <QrCode :value="publicKey" />
  </Modal>
  <PWModal @register="registerPWModal" />
</template>

<script lang="ts">
  import { defineComponent, ref, unref, nextTick } from 'vue';
  import { BasicTitle, BasicHelp } from '/@/components/Basic';
  import { Card, Avatar, Divider, Modal, Tag, Row, Col } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useApollo } from '/@/hooks/apollo/apollo';
  import { me } from '/@/hooks/apollo/gqlUser';
  import { session, useWallet } from '/@/hooks/nkn/getNKN';
  import {
    QrcodeOutlined,
    CopyOutlined,
    CheckCircleTwoTone,
    QuestionCircleTwoTone,
    CheckOutlined,
    CloseOutlined,
  } from '@ant-design/icons-vue';
  import { QrCode } from '/@/components/Qrcode/index';
  import { useCopyToClipboard } from '/@/hooks/web/useCopyToClipboard';
  import { useMessage } from '/@/hooks/web/useMessage';
  import PWModal from './changePWModal.vue';
  import { useModal } from '/@/components/Modal';
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
    },
    setup() {
      const { t } = useI18n('general.account');
      const userInfo = ref({});
      const publicKey = ref('');
      const visible = ref(false);
      const wallet = ref({});
      const status = ref(false);
      const token = localStorage.getItem('token');
      console.log(token);
      const { clipboardRef, copiedRef } = useCopyToClipboard();
      const { createMessage } = useMessage();
      const [registerPWModal, { openModal: openPwModal }] = useModal();
      function fetchData() {
        useApollo()
          .query({ query: me })
          .then((res) => {
            userInfo.value = res.data?.me;
            res.data?.me?.wallets.forEach((v) => {
              if (v.tags.length > 0) {
                v.tags.forEach((v1) => {
                  if (v1 === 'MESSAGE') {
                    wallet.value = v;
                  }
                });
              }
            });
          });
        useWallet().then((w) => {
          publicKey.value = w.getPublicKey();
        });
      }
      nextTick(() => {
        setInterval(() => {
          if (session) {
            status.value = 'Connected';
          } else {
            status.value = 'Connecting...';
          }
        }, 1000);
      });
      fetchData();
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
</style>
