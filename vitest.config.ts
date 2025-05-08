import Vue from '@vitejs/plugin-vue';
import VueJsx from '@vitejs/plugin-vue-jsx';
import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [Vue(), VueJsx()],
  optimizeDeps: {
    include: [
      'element-plus/es',
      'element-plus/es/components/form/style/index',
      'element-plus/es/components/radio-group/style/index',
      'element-plus/es/components/radio/style/index',
      'element-plus/es/components/checkbox/style/index',
      'element-plus/es/components/checkbox-group/style/index',
      'element-plus/es/components/switch/style/index',
      'element-plus/es/components/time-picker/style/index',
      'element-plus/es/components/date-picker/style/index',
      'element-plus/es/components/col/style/index',
      'element-plus/es/components/form-item/style/index',
      'element-plus/es/components/alert/style/index',
      'element-plus/es/components/breadcrumb/style/index',
      'element-plus/es/components/select/style/index',
      'element-plus/es/components/input/style/index',
      'element-plus/es/components/breadcrumb-item/style/index',
      'element-plus/es/components/tag/style/index',
      'element-plus/es/components/pagination/style/index',
      'element-plus/es/components/table/style/index',
      'element-plus/es/components/table-column/style/index',
      'element-plus/es/components/card/style/index',
      'element-plus/es/components/row/style/index',
      'element-plus/es/components/button/style/index',
      'element-plus/es/components/menu/style/index',
      'element-plus/es/components/sub-menu/style/index',
      'element-plus/es/components/menu-item/style/index',
      'element-plus/es/components/option/style/index',
      '@element-plus/icons-vue',
    ]
  },
  test: {
    environment: 'happy-dom',
    exclude: [...configDefaults.exclude, '**/e2e/**'],
  },
});
