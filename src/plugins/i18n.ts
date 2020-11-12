import type { App } from 'vue';
import { setupI18n } from '@/i18n';

function install (app: App) {
  app.use(setupI18n());
}

export default { install };