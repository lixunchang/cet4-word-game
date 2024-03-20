<script setup lang="ts">
import { DictionaryService } from '@/api/api';
import lettersAudio from '@/utils/letter';
import { onMounted, onUnmounted, reactive, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import { ElLoading } from 'element-plus'
 
const { currentRoute } = useRouter();
const route = currentRoute.value;

const state: any = reactive({
  total: 0,
  list: [],
  current: 1,
  audioIndex: 0,
  explainStatus: '',
  explain: {

  }
})

const currentWord = computed(()=>{
  return route.query.word || state.list?.[state.current]?.split(' ')[0] || ''
})

const currentExplain = computed(()=>{
  return state.explain[currentWord.value]
})

const handleClickSentence=(sentence: string)=>{
  const audio = new Audio(`http://dict.youdao.com/dictvoice?type=0&audio=${sentence}`);
  audio.play();
}


const handleKeyPress = (event:any) => {
  // if(!state.currentWord){
  //   //state.audioIndex>=0
  //   return;
  // }
  let audio:any;
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
    const config = lettersAudio[event.key];
    audio = new Audio(config.url);
    audio.playbackRate = 2; // 播放速度为0.5 - 2倍
    Object.keys(config).forEach(key=>{
      if(key!=='url'){
        audio[key] = config[key];
      }
    });
    if(state.audioIndex > (currentWord.value.length-1)*2){
      state.audioIndex = 0
    }else{
      state.audioIndex++;
    }
  }else{
    const errorChar = currentWord.value[state.audioIndex % currentWord.value.length];
    if(errorChar){
      ElMessage.error('你错了, 正确的字母是：' + currentWord.value[state.audioIndex % currentWord.value.length])
    }
  }
  if(audio){
    audio.play();
  }
};

onMounted(() => {  
  window.addEventListener('keydown', handleKeyPress);
  const wordsJson = localStorage.getItem('word_list');
  state.current = route.query.index||localStorage.getItem('current_index')||0;
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

watch(state.current,(val:number)=>{
  localStorage.set('max_index',Math.max(val, localStorage.get('max_index')||0) );
})

watch(currentWord, (newWord: string)=>{
  console.log('newWord', newWord)
  const wordJson = localStorage.getItem(newWord);
  if(wordJson){
    state.explain[newWord] = JSON.parse(wordJson);
    return;
  }
  state.explainStatus = 'loading';
  const loadingInstance = ElLoading.service({
    target: '.explain_status',
    text: '这个单词你认识吗...'
  })
  DictionaryService.getWordMean(newWord).then(({data}:any)=>{
    state.explain[newWord] = data;
    localStorage.setItem(newWord, JSON.stringify(data))
    state.explainStatus = '';
  }).catch(()=>{
    state.explainStatus = 'error';
  }).finally(()=>{
    loadingInstance.close()
  })
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress);
});

const handleReload=()=>{
  location.reload();
}

</script>

<template>
  <main>
    <div class="header">
      <span class="steps">{{state.current}} / {{state.list.length}}</span>
    </div>
    <div class="playground" :data-word="currentWord">
      <span class="char" v-for="(char,index) in currentWord" :key="currentWord+'-'+index" :class="{
        'audio_char': state.audioIndex < currentWord.length && state.audioIndex > index,
        'equal_char': state.audioIndex!==0 && state.audioIndex % (currentWord.length) === 0,
        'reserve_char': state.audioIndex >= currentWord.length && state.audioIndex % (currentWord.length+1) < index
      }">
        {{char}}
      </span>
    </div>
    <div class="explain_status">
      <div class="explain" v-if="currentExplain">
        <p style="color:#999;cursor:pointer;" @click="handleClickSentence(currentExplain.mean_en)">
          <label>英文：</label>
          <span style="flex:1;" class="ellipsis_word">{{currentExplain.mean_en}}</span>
        </p>
        <p class="chinese">
          <label>中文：</label>
          <span style="flex:1;text-align:left;color:red;font-weight: bold;">
            <span style="flex:1;">{{currentExplain.mean_cn}}</span>
          </span>
        </p>
        <p v-if="currentExplain.word_etyma">
          <label>词根：</label>
          <span style="flex:1;color:#555;">{{currentExplain.word_etyma}}</span>
        </p>
        <p @click="handleClickSentence(currentExplain.sentence)" style="cursor: pointer;">
          <label>例句：</label>
          <span style="flex:1;color:#666;">{{currentExplain.sentence}}</span>
        </p>
        <p>
          <label>翻译：</label>
          <span style="flex:1;text-align:left;color:#b2b2b2;">{{currentExplain.sentence_trans}}</span>
        </p>
      </div>
      <div v-else-if="state.explainStatus">
        <span v-if="state.explainStatus === 'loading'"></span>
        <span style="cursor:pointer;" v-if="state.explainStatus === 'error'" @click="handleReload">查询失败，请刷新重试</span>
      </div>
    </div>
  </main>
</template>
<style lang="scss" scoped>
  main{
    height: 100%;
    position: relative;
    .header{
      width: 100%;
      padding: 8px 12px;
      position: absolute;
      top: 0;
      left: 0;
      text-align: right;
      .steps{
        color:#222;
      }
    }
  }
  .playground{
    background-color: black;
    height: 60vh;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 88px;
    font-weight: bold;
    letter-spacing: 12px;
    .char{
      width: auto;
      min-width: 30px;
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
</style>@/constant/letter
