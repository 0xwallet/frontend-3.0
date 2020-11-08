import { Modal, message as Message } from 'ant-design-vue';
import notification from 'ant-design-vue/lib/notification';
notification.config({
    placement: 'topRight',
    duration: 3,
  });
export function useMessage () {
  return {
    notification
  };
}