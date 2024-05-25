<template>
  <div class="explain_status">
    <div class="explain" v-if="currentExplain">
      <p v-if="currentExplain.mean_en" style="color:#999;cursor:pointer;" @click="handleClickSentence(currentExplain.mean_en)">
        <label>英文</label>
        <span style="flex:1;" class="ellipsis_word">{{currentExplain.mean_en}}</span>
      </p>
      <p v-if="currentExplain.mean_cn" class="chinese">
        <label>中文</label>
        <span style="flex:1;text-align:left;color:red;font-weight: bold;">
          <span style="flex:1;">{{currentExplain.mean_cn}}</span>
        </span>
      </p>
      <p v-if="currentExplain.word_etyma&&(reviewType==='0'||reviewSentence)">
        <label>词根</label>
        <span style="flex:1;color:#555;">{{currentExplain.word_etyma}}</span>
      </p>
      <p v-if="currentExplain.sentence&&(reviewType==='0'||reviewSentence)" @click="handleClickSentence(currentExplain.sentence)" style="cursor: pointer;">
        <label>例句</label>
        <span style="flex:1;color:#666;">{{currentExplain.sentence}}</span>
      </p>
      <p v-if="currentExplain.sentence_trans&&(reviewType==='0'||reviewSentence)">
        <label>翻译</label>
        <span style="flex:1;text-align:left;color:#b2b2b2;">{{currentExplain.sentence_trans}}</span>
      </p>
    </div>
    <div v-else-if="explainStatus" class="explain_result">
      <span v-if="explainStatus === 'loading'" style="color:#999;">努力查询中...</span>
      <span style="cursor:pointer;" v-if="explainStatus === 'error'" @click="getWordExplain(currentWord)">查询失败，请刷新重试</span>
    </div>
  </div>
</template>
<script setup>
import { defineProps } from 'vue';
const { explainStatus, reviewType, reviewSentence, currentExplain }  = defineProps({
  reviewType:{
    type: String,
    defalut: ''
  },
  explainStatus: {
    type: String,
    defalut: ''
  },
  reviewSentence: {
    type: String,
    defalut: ''
  },
  currentExplain:{
    type: Object,
    defalut: {}
  }
})
</script>
<style scoped lang="scss">
.explain{
  font-size: 26px;
  color: #333;
  max-width: 1000px;
  margin: 0 auto;
  .chinese{
    color: #666;
  }
  label{
    display: inline-block;
    width: 120px;
    color: #e2e2e2;
  }
  p{
    overflow: hidden;
    display: flex;
    justify-content: space-between;
    -webkit-line-clamp: 2; /* 控制显示的行数 */
    -webkit-box-orient: vertical;
    text-overflow: ellipsis;
    white-space: normal;
    .ellipsis_word{
      display: -webkit-box;
      -webkit-line-clamp: 2; /* 控制显示的行数 */
      -webkit-box-orient: vertical;
      text-overflow: ellipsis;
      white-space: normal;
      text-align: left;
    }
  }
}
.explain_status{
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40vh;
}
.key-board{
  display: none;
}
.explain_result{
  text-align: center;
  padding-top: 66px;
}
</style>