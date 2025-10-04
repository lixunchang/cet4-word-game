<template>
  <el-dialog
    v-model="visible"
    title="格心单词陪练"
    width="800px"
    :max-height="0.9"
    :modal="true"
    :close-on-click-modal="true"
    :close-on-press-escape="true"
    :show-close="true"
    @close="closeModal"
  >
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="error" class="error">加载失败: {{ error }}</div>
    <div v-else class="markdown-content" v-html="renderedContent"></div>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="closeModal">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { marked } from 'marked';

const visible = defineModel({ type: Boolean, default: false });

const loading = ref(true);
const error = ref(null);
const markdownContent = ref('');

// 将 # 单词陪练 标题替换为 h3，其他标题层级相应调整
const processedContent = computed(() => {
  if (!markdownContent.value) return '';
  
  return markdownContent.value
    .replace(/^# (.*)$/gm, '### $1')  // 将 # 标题改为 ###
    .replace(/^## (.*)$/gm, '## $1')   // ## 保持不变
    .replace(/^### (.*)$/gm, '# $1')   // ### 改为 #
    .replace(/^#### (.*)$/gm, '## $1') // #### 改为 ##
    .replace(/^##### (.*)$/gm, '### $1') // ##### 改为 ###
    .replace(/^###### (.*)$/gm, '#### $1'); // ###### 改为 ####
});

const renderedContent = computed(() => {
  if (!processedContent.value) return '';
  return marked(processedContent.value);
});

const closeModal = () => {
  visible.value = false;
  // 存储标识到 localStorage
  localStorage.setItem('helpModalClosed', 'true');
};

// 获取 README.md 内容
const fetchReadme = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    // 从 public 目录获取 README.md
    const response = await fetch(`${location.origin}${location.pathname}/README.md`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    markdownContent.value = await response.text();
  } catch (err: Error | any) {
    error.value = err.message || 'Failed to load README.md';
    console.error('Failed to fetch README.md:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchReadme();
});

// 组件卸载时移除事件监听，但不再需要监听 ESC 键，因为 el-dialog 已经处理了
onUnmounted(() => {
  // 不再需要移除事件监听
});
</script>

<style lang="scss">
.loading, .error {
  text-align: center;
  padding: 20px;
  color: #666;
}

.error {
  color: #f56565;
}

.markdown-content {
  line-height: 1.6;
  max-height: 60vh;
  overflow-y: auto;
  padding: 1em;
}

.markdown-content h1 {
  font-size: 1.8em;
  margin: 1.5em 0 0.8em 0;
  color: #333;
  border-bottom: 2px solid #eee;
  padding-bottom: 0.4em;
  font-weight: bold;
}

.markdown-content h2 {
  font-size: 1.5em;
  margin: 1.2em 0 0.7em 0;
  color: #555;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.3em;
  font-weight: 600;
}

.markdown-content h3 {
  font-size: 1.3em;
  margin: 1em 0 0.6em 0;
  color: #666;
  font-weight: 500;
}

.markdown-content h4 {
  font-size: 1.1em;
  margin: 0.9em 0 0.5em 0;
  color: #777;
}

.markdown-content p {
  margin: 0.9em 0;
  color: #666;
  line-height: 1.8;
}

.markdown-content a {
  color: #409eff;
  text-decoration: none;
  transition: color 0.2s ease;
}

.markdown-content a:hover {
  text-decoration: underline;
  color: #337ecc;
}

.markdown-content ul, .markdown-content ol {
  padding-left: 1.8em;
  margin: 0.9em 0;
}

.markdown-content li {
  margin-bottom: 0.6em;
  position: relative;
}

.markdown-content ul > li::before {
  content: "•";
  color: #409eff;
  position: absolute;
  left: -1.2em;
  font-weight: bold;
}

.markdown-content ol > li::before {
  content: counter(list-item) ".";
  color: #409eff;
  position: absolute;
  left: -1.8em;
  font-weight: bold;
}

.markdown-content blockquote {
  border-left: 4px solid #409eff;
  padding: 0 1em;
  margin: 1.2em 0;
  color: #666;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.markdown-content code {
  background-color: #f1f1f1;
  padding: 2px 4px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.9em;
  color: #333;
}

.markdown-content pre {
  background-color: #f1f1f1;
  padding: 1.2em;
  border-radius: 4px;
  overflow-x: auto;
  margin: 1em 0;
  border: 1px solid #ddd;
}

.markdown-content img {
  max-width: 100%;
  min-height: 300px;
  height: auto;
  margin: 1em 0;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
</style>