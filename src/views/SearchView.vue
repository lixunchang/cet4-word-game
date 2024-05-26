<script setup lang="ts">
import { reactive, watch } from 'vue';
import allWords from '@/utils/words';
import { isAscending } from '@/utils/common';
import { DictionaryService } from '@/api/api';

// const messageList = ref()

const state = reactive({
  searchList:[],
  searchLimit: '0',
  searchWord:'',
  activeNames: [],
  explain: {},
  searchHistory: JSON.parse(localStorage.getItem('search-history')||'[]')
})

const limitStatus: any={
  0:'success',
  1:'warning',
  2:'primary',
  12:'danger',

}


const getWordExplain=(newWord: string)=>{
  console.log('newWord', newWord)
  if(!state.explain[newWord]){
    state.explain[newWord]={};
  }
  state.explain[newWord].loadingStatus = 'loading';
  // const loadingInstance = ElLoading.service({
  //   target: '.explain_status',
  //   text: '这个单词几个意思...',
  //   fullscreen: false
  // })
  DictionaryService.getWordMean(newWord).then(({data}:any)=>{
    state.explain[newWord] = data;
    localStorage.setItem(newWord, JSON.stringify(data))
    state.explain[newWord].loadingStatus = '';
  }).catch(()=>{
    state.explain[newWord].loadingStatus = 'error';
  }).finally(()=>{
    //loadingInstance.close()
  })
}

const prepareExplain=(word)=>{
  if(!state.explain[word]){
      const wordJson = localStorage.getItem(word);
      if(wordJson){
        state.explain[word] = JSON.parse(wordJson);
        return;
      }
      getWordExplain(word)
    }
}

watch(()=>state.activeNames, (newVal, oldVal)=>{
  if(newVal.length > oldVal.length){
    const newName = newVal[newVal.length - 1];
    prepareExplain(newName)
  }
})





const handleSearch=(value)=>{
  console.log('eee=', value)
  state.searchWord = value.trim();
  if(!state.searchWord){
    return;
  }
  const keys =  state.searchWord.split(' ');
  state.searchList = allWords.etc4.reduce((list,word)=>{
    const keyIndexs = keys.map(key=>word.indexOf(key));
    if(keyIndexs.every(i=>i!=-1)&&isAscending(keyIndexs)){
      let permitStart = true, permitEnd = true;
      if(state.searchLimit.includes('1')&&!word.startsWith(keys[0])){
        permitStart = false;
      }
      if(state.searchLimit.includes('2')&&!word.endsWith(keys[keys.length-1])){
        permitEnd = false;
      }
      if(permitStart&&permitEnd){
        prepareExplain(word);
        return [...list, word];
      }
      return list;
    }
    return list;
  },[]);
  const newSearchHistory = {
    keyWord: state.searchWord, 
    source: 'cet4', 
    limit: state.searchLimit
  };
  state.searchHistory.unshift(newSearchHistory);
  localStorage.setItem('search-history', JSON.stringify([newSearchHistory, ...state.searchHistory]))
}


</script>

<template>
  <div class="page">
    <div class="content">
      <el-input
        trim="both"
        v-model="state.searchWord"
        class="search-input"
        style=""
        placeholder="模糊搜索单词，多字母组合之间用空格隔开；例：m rry"
        @keyup.enter="(e)=>handleSearch(e.target.value)"
      >
        <template #prepend>
          <el-select v-model="state.searchLimit" placeholder="条件搜索" style="width: 115px">
            <el-option label="指定开头" value="1" />
            <el-option label="指定结尾" value="2" />
            <el-option label="首尾都指定" value="12" />
            <el-option label="首尾不限制" value="0" />
          </el-select>
        </template>
        <template #append>
          <el-button type="primary" @click="handleSearch(state.searchWord)">搜索</el-button>
        </template>
      </el-input>
      <div  class="search-result">
        <div class="search-history">
          <el-tag  v-for="i in state.searchHistory" :key="i.keyWord" :type="limitStatus[i.limit]">{{i.keyWord}}</el-tag>
        </div>
        <el-collapse v-model="state.activeNames">
          <el-collapse-item  v-for="item in state.searchList" :key="item" :name="item">
            <template #title>
              <div>
                <span class="title-word">{{ item }}</span>
                <span class="title-cn">{{ state.explain[item]&&state.explain[item].mean_cn }}</span>
              </div>
            </template>
            <p class="explain-item"><span class="label">英义：</span>{{state.explain[item]&&state.explain[item].mean_en}}</p>
            <p class="explain-item"><span class="label">词根：</span>{{state.explain[item]&&state.explain[item].word_etyma}}</p>
            <p class="explain-item"><span class="label">例句：</span>{{state.explain[item]&&state.explain[item].sentence}}</p>
            <p class="explain-item"><span class="label">翻译：</span>{{state.explain[item]&&state.explain[item].sentence_trans}}</p>
          </el-collapse-item>
        </el-collapse>
      </div>
      <!-- <div class="list">
        <div class="item" v-for="item in state.searchList" :key="item">{{item}}</div>
      </div> -->
    </div>
  </div>
</template>

<style scoped>
  .page{
    height: 100vh;
    padding-top: 1px;
    .content{
      height: 100%;
      background: #f9f9f9;
      width: 900px;
      padding: 20px 0 20px;
      margin: 0 auto;
      .search-input{
        width: 600px;
        position: fixed; 
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 999;
      }
      .search-history{
        max-width: 900px;
        padding: 8px;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        flex-wrap: wrap;
        gap: 10px;
      }
      .search-result{
        height: calc(100% - 40px);
        margin-top: 40px;
        overflow: auto;
      }
    }
    .title-word{
      font-size: 16px;
      color: #333;
      font-weight: bold;
      margin-right: 12px;
    }
    .title-cn{
      font-size: 14px;
      color: #333;
    }
    .explain-item{
      font-size: 14px;
      color: #666;
      .label{
        color: #999;
      }
    }
  }
</style>
