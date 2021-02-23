import { useApollo } from '/@/hooks/apollo/apollo';
import { sendVerifyCode } from '/@/hooks/apollo/gqlUser';
import { useI18n } from '/@/hooks/web/useI18n';
import { useMessage } from '/@/hooks/web/useMessage';
const { createMessage } = useMessage();
const { t } = useI18n();

export async function SendVerifyCode(
  params: { email?: string; type: string; nkn?: string } = { type: 'ACTIVE_EMAIL' }
): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    useApollo({
      mode: 'mutate',
      gql: sendVerifyCode,
      variables: params,
    }).then(() => {
      createMessage.success(t('sys.login.verificationSend'));
      resolve(true);
    });
  });
}
