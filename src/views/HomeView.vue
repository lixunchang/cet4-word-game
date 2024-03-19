<script setup lang="ts">
import { DictionaryService } from '@/api/api';
import { onMounted, onUnmounted, reactive, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';
const state: any = reactive({
  total: 0,
  list: [],
  current: 1,
  audioIndex: 0,
  explain: {

  }
    // {
    //   mean_en:'',
    //   mean_cn:'',
    //   word_etyma: '',
    //   sentence: '',
    //   sentence_trans: '',
    // }
})

const currentWord = computed(()=>{
  return state.list[state.current] || ''
})

const handleClickSentence=(sentence: string)=>{
  const audio = new Audio(`http://dict.youdao.com/dictvoice?type=0&audio=${sentence}`);
  audio.play();
}


const handleKeyPress = (event:any) => {
  console.log('next', event)
  let audio;
  if(['ArrowRight','ArrowUp'].includes(event.key)){
    state.current++;
    state.audioIndex = 0
    localStorage.setItem('current_index', state.current);
  }else if(['ArrowLeft','ArrowDown'].includes(event.key)){
    if(state.current>0){ 
      state.current--;  
      state.audioIndex = 0;
      localStorage.setItem('current_index', state.current);
    }else{
      ElMessage.error('已经是第一个了');
    }
  }else if (event.key === ' ') {
    audio = new Audio(`http://dict.youdao.com/dictvoice?type=0&audio=${currentWord.value}`);
    if(state.audioIndex > currentWord.value.length){
      state.audioIndex = 0
    }
  }else if(currentWord.value[state.audioIndex % (currentWord.value.length)]===event.key){
    audio =new Audio(`http://dict.youdao.com/dictvoice?type=0&audio=${event.key.toUpperCase()}`);
    audio.playbackRate = 1.9; // 播放速度为0.5 - 2倍
    if(state.audioIndex > (currentWord.value.length-1)*2){
      state.audioIndex = 0
    }else{
      state.audioIndex++;
    }
  }else{
    console.log(state.audioIndex, currentWord.value.length, state.audioIndex % (currentWord.value.length - 1))
    ElMessage.error('你错了, 正确的字母是：' + currentWord.value[state.audioIndex % (currentWord.value.length - 1)])
  }
  if(audio){
    audio.play();
  }
};

onMounted(() => {  
  window.addEventListener('keydown', handleKeyPress);
  const wordsJson = localStorage.getItem('word_list');
  state.current = localStorage.getItem('current_index')||0;
  if(wordsJson){
    const data = JSON.parse(wordsJson);
    state.list = data.list;
    state.total = data.total;
    return;
  }
  DictionaryService.getWordList().then(({data}:any)=>{
    state.list = data.list;
    state.total = data.total;
    localStorage.setItem('word_list', JSON.stringify(data))
  })

});

watch(currentWord, (newWord: string)=>{
  console.log('newWord', newWord)
  const wordJson = localStorage.getItem(newWord);
  if(wordJson){
    state.explain[newWord] = JSON.parse(wordJson);
    return;
  }
  DictionaryService.getWordMean(newWord).then(({data}:any)=>{
    state.explain[newWord] = data;
    localStorage.setItem(newWord, JSON.stringify(data))
  })
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress);
});

</script>

<template>
  <main>
    <div class="playground" :data-word="currentWord">
      <span class="char" v-for="(char,index) in currentWord" :key="currentWord+'-'+char" :class="{
        'audio_char': state.audioIndex < currentWord.length && state.audioIndex > index,
        'equal_char': state.audioIndex!==0 && state.audioIndex % (currentWord.length) === 0,
        'reserve_char': state.audioIndex >= currentWord.length && state.audioIndex % (currentWord.length+1) < index
      }">
        {{char}}
      </span>
    </div>
    <div class="explain" v-if="state.explain[currentWord]">
      <p class="chinese"><label>中文：</label>
        <span style="color:red;font-weight: bold;"><span style="flex:1;">{{state.explain[currentWord].mean_cn}}</span></span>
      </p>
      <p><label>词根：</label><span style="flex:1;">{{state.explain[currentWord].word_etyma}}</span></p>
      <p style="color:#999;cursor:pointer;" @click="handleClickSentence(state.explain[currentWord].mean_en)">
        <label>英文：</label>
        <span style="flex:1;" class="ellipsis_word">{{state.explain[currentWord].mean_en}}</span>
      </p>
      <p @click="handleClickSentence(state.explain[currentWord].sentence)" style="cursor: pointer;"><label>例句：</label><span style="flex:1;">{{state.explain[currentWord].sentence}}</span></p>
      <p class="chinese"><label>翻译：</label><span style="flex:1;">{{state.explain[currentWord].sentence_trans}}</span></p>
    </div>
  </main>
</template>
<style lang="scss" scoped>
  .playground{
    background-color: black;
    height: 60vh;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 80px;
    font-weight: bold;
    .char{
      width: 60px;
      height: 100%;
      color: white;
      vertical-align: middle;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0;
    }
    .audio_char{
      color: #000;
    }
    .equal_char{
      color: #000;
    }
    .reserve_char{
      color: #000;
    }
  }
  .explain{
    padding: 24px;
    font-size: 26px;
    color: #333;
    .chinese{
      color: #666;
    }
    label{
      display: inline-block;
      width: 120px;
      color: #999;
    }
    p{
      overflow: hidden;
      display: flex;
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
      }
    }
  }
</style>
