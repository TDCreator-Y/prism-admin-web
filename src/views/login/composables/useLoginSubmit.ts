import { reactive, ref } from 'vue';
import { useLoginFlow, type LoginCredentials, type LoginRequestHandler } from '@/composables/useLoginFlow';

export interface UseLoginSubmitOptions<T = unknown> {
  requestHandler: LoginRequestHandler<T>;
  validate?: (credentials: LoginCredentials) => string | null;
}

export function useLoginSubmit<T = unknown>(options: UseLoginSubmitOptions<T>) {
  const { login } = useLoginFlow();
  const form = reactive<LoginCredentials>({
    username: '',
    password: '',
  });
  const isLoading = ref(false);
  const errorMsg = ref('');

  async function handleLogin() {
    const credentials: LoginCredentials = {
      username: form.username,
      password: form.password,
    };

    const validationError =
      options.validate?.(credentials) ??
      (!credentials.username || !credentials.password ? '请输入用户名和密码' : null);

    if (validationError) {
      errorMsg.value = validationError;
      return;
    }

    isLoading.value = true;
    errorMsg.value = '';

    try {
      return await login(credentials, options.requestHandler);
    } catch (error) {
      errorMsg.value = error instanceof Error ? error.message : '登录失败，请稍后重试';
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    form,
    isLoading,
    errorMsg,
    handleLogin,
  };
}
