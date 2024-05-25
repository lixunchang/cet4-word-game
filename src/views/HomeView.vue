<script setup lang="ts">
import { DictionaryService } from '@/api/api';
import lettersAudio from '@/utils/letter';
import allWords from '@/utils/words';
import { onMounted, onUnmounted, reactive, computed, watch, ref } from 'vue';
// import { ElMessage } from 'element-plus';
import { useRouter, useRoute } from 'vue-router';
// import { ElLoading } from 'element-plus'
import { isLetter } from '@/utils/keyborad';
import Message from '@/components/IMessage.vue'


const router = useRouter();
const route = useRoute();

const skillInputRef = ref<any>(null);

const handleSkillEnter=()=>{
  state.skillFocus = false
  skillInputRef.value.blur()
}

const type: any = route.query.type || 'etc4';
const review: any = route.query.review || '0';

const state: any = reactive({
  list: allWords[type] || allWords.etc4,
  reviewType: review,
  current: 0,
  audioIndex: 0,
  explainStatus: '',
  enterAudio: 'mean_en',//'sentence'
  reviewSentence: false, // 复习状态展示词根和例句
  msg:{
    type:'error',
    text: ''
  },
  explain: {
    abandoned:{
      mean_en: 'forsaken by owner or keeper; free from constraint.',
      mean_cn: 'adj. 被抛弃的；废弃的，放纵的，不再考虑的; v. 放弃，逃离，中止（abandon 的过去式和过去分词）',
      word_etyma: '',
      sentence: `At the captain's order, they abandoned ship.`,
      sentence_trans: '在船长的命令下，他们弃船离开了。'
    },
    Christ: {
      mean_cn: '基督; 耶稣基督'
    },
    ninetheen:{
      mean_cn: '十九'
    },
  },
  currentSkillWord: '',
  skills: undefined,
  skillFocus: false
})

const currentWord = computed(()=>{
  return route.query.word || state.list?.[state.current]?.split(' ')[0] || ''
})

const nextWord = computed(()=>{
  return state.list?.[state.current+1]?.split(' ')[0] || ''
})

const currentSkill = computed({
        get() {
          console.log('get-value', state.skills, currentWord.value, state.current)
          return state.skills?.[currentWord.value]
        },
        set(value) {
          console.log('set-value', state.skills, currentWord.value, state.current)
          state.skills[currentWord.value] = value;
        }
      })

const showErrorMessage=(text = '')=>{
  state.msg.text = text;
  setTimeout(()=>state.msg.text = '', 2000);
}

const currentExplain = computed(()=>{
  return state.explain[currentWord.value]
})

const handleClickSentence=(sentence: string)=>{
  const audio = new Audio(`https://dict.youdao.com/dictvoice?type=0&audio=${sentence}`);
  audio.play();
}

const onSkillChange=(val:string)=>{
  console.log('currentSkill',currentSkill, state.skills)
  localStorage.setItem('word_skills', JSON.stringify({...state.skills,[currentWord.value]:val}))
}


const handleKeyPress = (event:any) => {
  if(state.skillFocus || event.altKey || event.ctrlKey || event.metaKey){
    return;
  }
  let audio:any;
  if(['ArrowRight','Enter'].includes(event.key)){
    state.current++;
    state.audioIndex = 0;
    state.enterAudio = 'mean_en';
    state.reviewSentence = false;
    localStorage.setItem('current_index', state.current);
    resetRouter();
  }else if(['ArrowLeft'].includes(event.key)){
    if(state.current>0){ 
      state.current--;  
      state.audioIndex = 0;
      state.enterAudio = 'mean_en';
      state.reviewSentence = false;
      localStorage.setItem('current_index', state.current);
    }else{
      showErrorMessage('已经是第一个了');
    }
  }else if(['ArrowUp', 'ArrowDown', 'Tab'].includes(event.key)){
    event.preventDefault?.();
    if(state.reviewType!=='0' && !state.reviewSentence){
      state.reviewSentence = true;
      return;
    }
    if(currentExplain.value?.[state.enterAudio]){
      audio = new Audio(`https://dict.youdao.com/dictvoice?type=0&audio=${currentExplain.value[state.enterAudio]}`);
      state.enterAudio = state.enterAudio === 'mean_en'?'sentence':'mean_en';
    }else if(currentExplain.value){
      state.enterAudio = state.enterAudio === 'mean_en'?'sentence':'mean_en';
    }
  }else if (event.key === ' ') {
    audio = new Audio(`https://dict.youdao.com/dictvoice?type=0&audio=${currentWord.value}`);
    // console.log('message==>', state.audioIndex)
    // if(state.audioIndex > (currentWord.value.length-1)*2){
    //   state.audioIndex = 0
    // }
  }else if(currentWord.value[state.audioIndex % (currentWord.value.length)]===event.key){
    const config = lettersAudio[event.key.toLowerCase()];
    if(!config?.url){
      showErrorMessage('程序遇到Bug，请联系QQ: 907203644')
    }
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
      showErrorMessage('请输入：' + currentWord.value[state.audioIndex % currentWord.value.length])
    }
  }
  if(audio){
    audio.play();
  }
};

const resetRouter=()=>router.push({ query: state.reviewType !== '0'?{review:state.reviewType}:{} });

const getWordExplain=(newWord: string)=>{
  state.explainStatus = 'loading';
  // const loadingInstance = ElLoading.service({
  //   target: '.explain_status',
  //   text: '这个单词几个意思...',
  //   fullscreen: false
  // })
  DictionaryService.getWordMean(newWord).then(({data}:any)=>{
    state.explain[newWord] = data;
    localStorage.setItem(newWord, JSON.stringify(data))
    state.explainStatus = '';
  }).catch(()=>{
    state.explainStatus = 'error';
  }).finally(()=>{
    //loadingInstance.close()
  })
}

watch(()=>state.reviewType,(newType)=>{
  if(newType !=='0'){
    state.audioIndex = state.reviewType * currentWord.value.length;
  }else{
    state.audioIndex = 0
    resetRouter();
  }
})

watch(()=>state.current, (val:number)=>{
  localStorage.setItem('current_index','' + val);
  localStorage.setItem('max_index', '' + Math.max(val, +(localStorage.getItem('max_index') || 0)));
})

watch(currentWord, (newWord: string)=>{
  if(!newWord) return;
  state.audioIndex = state.reviewType * newWord.length;
  if(state.explain[newWord]){
    return;
  }
  const wordJson = localStorage.getItem(newWord);
  if(wordJson){
    state.explain[newWord] = JSON.parse(wordJson);
    return;
  }
  getWordExplain(newWord);
}, { immediate: true })

watch(nextWord, (newWord: string)=>{
  if(!newWord) return;
  if(state.explain[newWord]){
    return;
  }
  const wordJson = localStorage.getItem(newWord);
  if(wordJson){
    state.explain[newWord] = JSON.parse(wordJson);
    return;
  }
  getWordExplain(newWord);
}, { immediate: true })

watch(()=>route.query, (val)=>{
  if(Object.keys(val).length>0){
    location.reload()
  }
})


onMounted(() => {
  window.addEventListener('keydown', handleKeyPress);
  state.current = route.query.index||localStorage.getItem('current_index') || 0;
  const wordSkills = localStorage.getItem('word_skills');
  if(wordSkills){
    state.skills = JSON.parse(wordSkills);
    console.log('---', state.skills);
  }
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


onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress);
});

</script>

<template>
  <main>
    <div class="header">
      <span class="header-left">
        <el-link :underline="false" href="https://gexinpai.github.io/cet4-word-game/#/search" target="_blank">模糊搜索</el-link>
      </span>
      <span class="header-right">
        <span class="steps">{{state.current}} / {{state.list.length}}</span>
        <el-switch
          v-model="state.reviewType"
          class="review-type"
          inline-prompt
          active-text="复习"
          inactive-text="陪练"
          active-value="1"
          inactive-value="0"
        />
        <a class="help" target="_blank" href="https://gitee.com/gexinpai/cet4-word-game/blob/main/README.md">使用帮助</a>
      </span>
    </div>
    <message v-show="state.msg.text" :text="state.msg.text" :type="state.msg.type"/>
    <div class="playground" :data-word="currentWord">
      <span class="char" v-for="(char,index) in currentWord" :key="currentWord+'-'+index" :class="{
        'audio_char': state.audioIndex < currentWord.length && state.audioIndex > index,
        'equal_char': state.audioIndex!==0 && state.audioIndex % (currentWord.length) === 0,
        'reserve_char': state.audioIndex >= currentWord.length && state.audioIndex % (currentWord.length+1) < index
      }">
        {{char}}
      </span>
      <div class="skill">
        <el-input
          ref="skillInputRef"
          v-model="currentSkill" 
          :placeholder="state.skillFocus?'记录下自己的速记方法，60个字内...':''" 
          maxlength="60" 
          :show-word-limit2="state.skillFocus" 
          @focus="state.skillFocus = true" 
          @blur="state.skillFocus = false" 
          @keyup.enter="handleSkillEnter"
          @change="onSkillChange"
        >
          <!-- <template v-if="state.skillFocus" #prepend>备注：</template> -->
        </el-input>
      </div>
    </div>
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
        <p v-if="currentExplain.word_etyma&&(state.reviewType==='0'||state.reviewSentence)">
          <label>词根</label>
          <span style="flex:1;color:#555;">{{currentExplain.word_etyma}}</span>
        </p>
        <p v-if="currentExplain.sentence&&(state.reviewType==='0'||state.reviewSentence)" @click="handleClickSentence(currentExplain.sentence)" style="cursor: pointer;">
          <label>例句</label>
          <span style="flex:1;color:#666;">{{currentExplain.sentence}}</span>
        </p>
        <p v-if="currentExplain.sentence_trans&&(state.reviewType==='0'||state.reviewSentence)">
          <label>翻译</label>
          <span style="flex:1;text-align:left;color:#b2b2b2;">{{currentExplain.sentence_trans}}</span>
        </p>
      </div>
      <div v-else-if="state.explainStatus" class="explain_result">
        <span v-if="state.explainStatus === 'loading'" style="color:#999;">努力查询中...</span>
        <span style="cursor:pointer;" v-if="state.explainStatus === 'error'" @click="getWordExplain(currentWord)">查询失败，请刷新重试</span>
      </div>
    </div>
    <div class="key-board">
      <div class="letters">
        <div>
          <span @click="handleKeyPress({key:'q', keyCode: 66})">Q</span>
          <span @click="handleKeyPress({key:'w', keyCode: 66})">W</span>
          <span @click="handleKeyPress({key:'e', keyCode: 66})">E</span>
          <span @click="handleKeyPress({key:'r', keyCode: 66})">R</span>
          <span @click="handleKeyPress({key:'t', keyCode: 66})">T</span>
          <span @click="handleKeyPress({key:'y', keyCode: 66})">Y</span>
          <span @click="handleKeyPress({key:'u', keyCode: 66})">U</span>
          <span @click="handleKeyPress({key:'i', keyCode: 66})">I</span>
          <span @click="handleKeyPress({key:'o', keyCode: 66})">O</span>
          <span @click="handleKeyPress({key:'p', keyCode: 66})">P</span>
        </div>
        <div>
          <span @click="handleKeyPress({key:'a', keyCode: 66})">A</span>
          <span @click="handleKeyPress({key:'s', keyCode: 66})">S</span>
          <span @click="handleKeyPress({key:'d', keyCode: 66})">D</span>
          <span @click="handleKeyPress({key:'f', keyCode: 66})">F</span>
          <span @click="handleKeyPress({key:'g', keyCode: 66})">G</span>
          <span @click="handleKeyPress({key:'h', keyCode: 66})">H</span>
          <span @click="handleKeyPress({key:'j', keyCode: 66})">J</span>
          <span @click="handleKeyPress({key:'k', keyCode: 66})">K</span>
          <span @click="handleKeyPress({key:'l', keyCode: 66})">L</span>
        </div>
        <div>
          <span @click="handleKeyPress({key:'z', keyCode: 66})">Z</span>
          <span @click="handleKeyPress({key:'x', keyCode: 66})">X</span>
          <span @click="handleKeyPress({key:'c', keyCode: 66})">C</span>
          <span @click="handleKeyPress({key:'v', keyCode: 66})">V</span>
          <span @click="handleKeyPress({key:'b', keyCode: 66})">B</span>
          <span @click="handleKeyPress({key:'n', keyCode: 66})">N</span>
          <span @click="handleKeyPress({key:'m', keyCode: 66})">M</span>
        </div>
      </div>
      <div class="action">
        <span @click="handleKeyPress({key:'ArrowRight'})">下一个</span>
        <span style="flex:2;" @click="handleKeyPress({key:' '})">空格</span>
        <span @click="handleKeyPress({key:'ArrowLeft'})">上一个</span>
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
      z-index: 1;
      .header-left{
        display: flex;
        align-items: center;
        .search-icon{
          font-size: 16px;
          color: #fff;
        }
      }
      .header-right{
        display: flex;
        align-items: center;
        .help{
          color: #444;
          &:hover{
            color: #999;
            background: transparent;
          }
        }
        .review-type{
          margin: 0 12px;
          opacity: 0.6;
          &:hover{
            opacity: 1;
          }
          :deep(.el-switch__core){
            background: #333;
            border-color: #444;
          }
          :deep(.el-switch__action){
            background: #666;
            border-color: #999;
          }
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
    font-weight: bold;
    letter-spacing: 12px;
    position: relative;
    .skill{
      width: 100%;
      position: absolute;
      bottom: 0;
      left: 0;
      .el-input{
        width: 100%;
        :deep(.el-input-group__prepend){
          letter-spacing: 0;
          border-radius: 0;
          background: #000;
          color: #fff;
        }
        :deep(.el-input__wrapper){
          border-radius: 0;
          border: none;
          background: transparent;
          box-shadow: none;
          &.is-focus{
            background: #000;
            color: #fff;
            border: none;
            .el-input__inner{
              text-align: center;
            };
          }
          .el-input__inner{
            color: #fff;
            text-align: center;
          }
          .el-input__count-inner{
            background: transparent;
            letter-spacing: 0;
          }
        }
      }
    }
    .char{
      width: auto;
      min-width: 30px;
      font-size: 88px;
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
  @media screen and (max-width: 600px) {
    .playground {
      height: 24vh;
      letter-spacing: 4px;
      .char{
        min-width: 16px;
        font-size: 60px;
      }
    }
    .explain_status {
      height: calc(76vh - 250px);
      padding: 10px 14px 0;
      overflow-y: auto;
      display: block;
      .explain{
        font-size: 18px;
        p{
          margin-bottom: 2px;
        }
        .ellipsis_word{
          -webkit-line-clamp: 3; /* 控制显示的行数 */
        }
      }
      label{
        width: 48px;
        line-height: 30px;
        font-size: 16px;
      }
    }
    .key-board{
      display: block;
      padding: 6px 4px 0;
      height: 250px;
      .action{
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 10px;
        span{
          border-radius: 10px 10px 0 0;
          border: 1px solid #eee;
          padding: 6px 0;
          flex: 1;
          text-align: center;
          &:active{
            background: #eee;
            color: #999;
          }
        }
      }
      .letters{
        div{
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
          span{
            border-radius: 10px 10px 0 0;
            border: 1px solid #eee;
            padding: 10px 0;
            flex: 1;
            text-align: center;
            &:active{
              background: #eee;
              color: #999;
            }
          }
        }
      }
    }
  }
</style>@/constant/letter
