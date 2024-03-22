<script setup lang="ts">
import { DictionaryService } from '@/api/api';
import lettersAudio from '@/utils/letter';
import allWords from '@/utils/words';
import { onMounted, onUnmounted, reactive, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import { ElLoading } from 'element-plus'
import { isLetter } from '@/utils/keyborad';
 
const { currentRoute } = useRouter();
const route = currentRoute.value;

const type: any = route.query.type||'etc4';

const state: any = reactive({
  list: allWords[type] || allWords.etc4,
  current: 1,
  audioIndex: 0,
  explainStatus: '',
  enterAudio: 'mean_en',//'sentence'
  explain: {
    abandoned:{
      mean_en: 'forsaken by owner or keeper; free from constraint.',
      mean_cn: 'adj. 被抛弃的；废弃的，放纵的，不再考虑的; v. 放弃，逃离，中止（abandon 的过去式和过去分词）',
      word_etyma: '',
      sentence: `At the captain's order, they abandoned ship.`,
      sentence_trans: '在船长的命令下，他们弃船离开了。'
    }
  }
})

const currentWord = computed(()=>{
  
  return route.query.word || state.list?.[state.current]?.split(' ')[0] || ''
})

const currentExplain = computed(()=>{
  return state.explain[currentWord.value]
})

const handleClickSentence=(sentence: string)=>{
  const audio = new Audio(`https://dict.youdao.com/dictvoice?type=0&audio=${sentence}`);
  audio.play();
}


const handleKeyPress = (event:any) => {
  if(event.altKey||event.ctrlKey||event.metaKey){
    return;
  }
  let audio:any;
  if(['ArrowRight','Enter'].includes(event.key)){
    state.current++;
    state.audioIndex = 0;
    state.enterAudio = 'mean_en';
    localStorage.setItem('current_index', state.current);
  }else if(['ArrowLeft'].includes(event.key)){
    if(state.current>0){ 
      state.current--;  
      state.audioIndex = 0;
      state.enterAudio = 'mean_en';
      localStorage.setItem('current_index', state.current);
    }else{
      ElMessage.error('已经是第一个了');
    }
  }else if(['ArrowUp', 'ArrowDown', 'Shift'].includes(event.key)){
    console.log(currentExplain.value?.[state.enterAudio], currentExplain.value, state.enterAudio)
    if(currentExplain.value?.[state.enterAudio]){
      audio = new Audio(`https://dict.youdao.com/dictvoice?type=0&audio=${currentExplain.value[state.enterAudio]}`);
      state.enterAudio = state.enterAudio === 'mean_en'?'sentence':'mean_en';
    }
  }else if (event.key === ' ') {
    audio = new Audio(`https://dict.youdao.com/dictvoice?type=0&audio=${currentWord.value}`);
    if(state.audioIndex > currentWord.value.length){
      state.audioIndex = 0
    }
  }else if(currentWord.value[state.audioIndex % (currentWord.value.length)]===event.key){
    const config = lettersAudio[event.key];
    audio = new Audio(location.origin+location.pathname+config.url);
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
  }else if(isLetter(event)){
    const errorChar = currentWord.value[state.audioIndex % currentWord.value.length];
    if(errorChar){
      ElMessage.error('请输入：' + currentWord.value[state.audioIndex % currentWord.value.length])
    }
  }
  if(audio){
    audio.play();
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeyPress);
  state.current = route.query.index||localStorage.getItem('current_index')||0;
  if(type==='etc4'){
    return;
  }
  const wordsJson = localStorage.getItem('word_list');
  if(wordsJson){
    const data = JSON.parse(wordsJson);
    state.list = data.list;
    return;
  }
  DictionaryService.getWordList().then(({data}:any)=>{
    state.list = data.list;
    localStorage.setItem('word_list', JSON.stringify(data))
  })
});

watch(state.current,(val:number)=>{
  localStorage.set('max_index',Math.max(val, localStorage.get('max_index')||0) );
})

watch(currentWord, (newWord: string)=>{
  if(state.explain[newWord]){
    return;
  }
  const wordJson = localStorage.getItem(newWord);
  if(wordJson){
    state.explain[newWord] = JSON.parse(wordJson);
    return;
  }
  state.explainStatus = 'loading';
  const loadingInstance = ElLoading.service({
    target: '.explain_status',
    text: '这个单词几个意思...',
    fullscreen: false
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
}, { immediate: true })

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
      <a class="help" target="_blank" href="https://gitee.com/gexinpai/cet4-word-game/blob/main/README.md">使用帮助</a>
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
        <p v-if="currentExplain.mean_en" style="color:#999;cursor:pointer;" @click="handleClickSentence(currentExplain.mean_en)">
          <label>英文：</label>
          <span style="flex:1;" class="ellipsis_word">{{currentExplain.mean_en}}</span>
        </p>
        <p v-if="currentExplain.mean_cn" class="chinese">
          <label>中文：</label>
          <span style="flex:1;text-align:left;color:red;font-weight: bold;">
            <span style="flex:1;">{{currentExplain.mean_cn}}</span>
          </span>
        </p>
        <p v-if="currentExplain.word_etyma">
          <label>词根：</label>
          <span style="flex:1;color:#555;">{{currentExplain.word_etyma}}</span>
        </p>
        <p v-if="currentExplain.sentence" @click="handleClickSentence(currentExplain.sentence)" style="cursor: pointer;">
          <label>例句：</label>
          <span style="flex:1;color:#666;">{{currentExplain.sentence}}</span>
        </p>
        <p v-if="currentExplain.sentence_trans">
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
      display: flex;
      align-items: center;
      justify-content: space-between;
      .help{
        color: #444;
        &:hover{
          color: #999;
          background: transparent;
        }
      }
      .steps{
        color:#2b2b2b;
        &:hover{
          color: #999;
        }
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
