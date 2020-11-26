<template>
  <CollapseContainer title="安全设置" :canExpan="false">
    <List>
      <ListItem>
        <ListItemMeta>
          <template #title>
            账户密码
            <div class="extra"> <a-button type="link" @click="openPWModal">修改</a-button> </div>
          </template>
          <template #description>
            <div>当前密码强度：强 </div>
          </template>
        </ListItemMeta>
      </ListItem>
    </List>
    <changePWModal @register="registerModal" />
  </CollapseContainer>
</template>
<script lang="ts">
  import { List } from 'ant-design-vue';
  import { defineComponent } from 'vue';
  import { CollapseContainer } from '/@/components/Container/index';

  import changePWModal from './changePWModal.vue';
  import { useModal } from '/@/components/Modal';

  export default defineComponent({
    components: {
      CollapseContainer,
      List,
      ListItem: List.Item,
      ListItemMeta: List.Item.Meta,
      changePWModal,
    },
    setup() {
      const [registerModal, { openModal }] = useModal();
      function openPWModal() {
        openModal(true);
      }
      return {
        registerModal,
        openPWModal,
      };
    },
  });
</script>
<style lang="less" scoped>
  .extra {
    float: right;
    margin-top: 10px;
    margin-right: 30px;
    font-weight: normal;
    color: #1890ff;
    cursor: pointer;
  }
</style>
