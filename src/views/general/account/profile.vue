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

      <Tag :color="status === 'Connected' ? '#52c41a' : '#f50'">
        <CheckCircleTwoTone v-if="status === 'Connected'" twoToneColor="#52c41a" />
        <QuestionCircleTwoTone v-if="status !== 'Connected'" twoToneColor="#f50" />
        {{ status }} Primary NKN Public Address
      </Tag>
    </Card>
    <Divider />
  </Card>
  <Modal v-model:visible="visible" :footer="null">
    <QrCode :value="publicKey" />
  </Modal>
</template>

<script lang="ts">
  import { defineComponent, ref, unref, nextTick } from 'vue';
  import { BasicTitle, BasicHelp } from '/@/components/Basic';
  import { Card, Avatar, Divider, Modal, Tag } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useApollo } from '/@/hooks/apollo/apollo';
  import { me } from '/@/hooks/apollo/gqlUser';
  import { session, useWallet } from '/@/hooks/nkn/getNKN';
  import {
    QrcodeOutlined,
    CopyOutlined,
    CheckCircleTwoTone,
    QuestionCircleTwoTone,
  } from '@ant-design/icons-vue';
  import { QrCode } from '/@/components/Qrcode/index';
  import { useCopyToClipboard } from '/@/hooks/web/useCopyToClipboard';
  import { useMessage } from '/@/hooks/web/useMessage';

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
    },
    setup() {
      const { t } = useI18n('general.account');
      const userInfo = ref({});
      const publicKey = ref('');
      const visible = ref(false);
      const status = ref('Connecting...');
      const { clipboardRef, copiedRef } = useCopyToClipboard();
      const { createMessage } = useMessage();

      function fetchData() {
        useApollo()
          .query({ query: me })
          .then((res) => {
            userInfo.value = res.data?.me;
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
      };
    },
  });
</script>
<style lang="less" scoped>
  .setRight {
    float: right;
  }
</style>
