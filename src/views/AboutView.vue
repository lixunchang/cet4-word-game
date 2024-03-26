<script setup>
import {ref} from 'vue';
import { ImBox } from 'vue-demi-common'
import { reactive } from 'vue';

// const messageList = ref()

const state = reactive({
  msgList:[
  {
    type:'text',
    content:'你好呀，交个朋友呗',
    from:'a'
  },
  {
    type:'text',
    content:'你好呀',
    from:'1'
  },
  {
    type:'text',
    content:'你叫什么名字',
    from:'a'
  },
]
})

const userInfo = ref({
  id:'1'
})

const quicks=[
  {
    text: '平台操作手册'
  },
  {
    text: '常见问题一'
  },
  {
    text: '常见问题二'
  }
]

const handleSendMessage=(message)=>{
  state.msgList.push({
    ...message,
    id: Date.now()
  });
}

</script>

<template>
  <im-box 
    :msgList="state.msgList" 
    :userInfo="userInfo" 
    :quickQuestions="quicks"
    @sendMessage="handleSendMessage"
  />
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
