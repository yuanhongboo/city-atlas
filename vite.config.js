import { defineConfig } from 'vite';

export default defineConfig({
  // 本地默认使用相对资源路径；发布工作流会传入实际 Pages 子路径。
  base: './',
});
