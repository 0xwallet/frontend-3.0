<script lang="tsx">
import {computed, defineComponent, ref, unref} from 'vue';
import { useI18n } from '/@/hooks/web/useI18n';
import {useQuery} from "@vue/apollo-composable";
import {NetFile, NetGql} from "/@/components/NetFile";
import {useRouter} from "vue-router";
import { BasicForm, useForm } from '/@/components/Form';
import {fileStore} from "/@/store/modules/netFile";
export default defineComponent({
  name: 'ShareFile',
  components: { BasicForm },
  props:{

  },
  setup() {
    const { t } = useI18n();
    const { currentRoute } = useRouter();
    const params = computed(() => {
      return unref(currentRoute).query;
    });
    const needCode=ref(false)
    const isDir=ref(false)
    const { onResult: PreviewShare } = useQuery(NetGql.Share.Preview, params.value);
    PreviewShare((res) => {
      needCode.value = res.data?.drivePreviewShare.needCode;
      // userPreview.value = res.data?.drivePreviewShare.UserPreview;
      console.log(res)
      fetchData()
    });
    const [registerForm, { validateFields }] = useForm({
      schemas: [
        {
          field: 'code',
          component: 'Input',
          label: t('code'),
          required: true,
          colProps: {
            span: 24,
          },
          defaultValue: '',
        },
      ],
      showActionButtonGroup: true,
      showResetButton: false,
      submitButtonOptions: {
        text: 'Submit',
      },
      actionColOptions: {
        span: 24,
      },
      submitFunc: fetchData,
    });
    async function fetchData() {
      if(!needCode.value){
        await fileStore.fetchShareFile(params.value);
      }else {
        const { code } = await validateFields();
        params.value.code = code;
        await fileStore.fetchShareFile(params.value);
      }
    }
    const file = computed<NetFile>(async () => {
      const f=fileStore.getShareFile
      console.log(f)
      if(f.length===1){
        isDir.value=false
        return f[0];
      }
      isDir.value=true

      return f;
    });

    return () => {
      return <div>111{file}</div>
      // if(!unref(needCode)){
      // return <BasicForm register={registerForm} layout="vertical"/>
      // }
    }
  },
});
</script>
