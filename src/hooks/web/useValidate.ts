import { reactive } from 'vue';
type Valid = { [key: string]: Array<object> };
const validate: Valid = {
  email: [{ required: true, message: '请输入账号', trigger: 'blur' },
          // eslint-disable-next-line no-useless-escape
          { message: '邮箱格式有误', trigger: 'blur', pattern: /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/ }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  code: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
};

export function useFormValid (valids: (string | Array<string>)[]) {
  const needValid: Valid = {};
  valids.forEach(valid => {
    switch (typeof valid) {
      case 'string': {
        needValid[valid] = validate[valid];
        break;
      }
      case 'object': {
        needValid[valid[1]] = validate[valid[0]];
        break;
      }
    }
    
  });
  return reactive(needValid);
}