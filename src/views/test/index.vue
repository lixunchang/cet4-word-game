<template>
  <div>
    <!-- <v-form-designer></v-form-designer> -->
   <v-form-render :form-json="formJson" :form-data="formData" :option-data="optionData" ref="vFormRef">
   </v-form-render>
   <el-button type="primary" @click="submitForm">Submit2</el-button>
  </div>
</template>
  <script setup>
  import { ref, reactive } from 'vue'
  import { ElMessage } from 'element-plus'
  import data from './data.js';


  const data222 = {"widgetList":[],"formConfig":{"modelName":"formData","refName":"vForm","rulesName":"rules","labelWidth":80,"labelPosition":"left","size":"","labelAlign":"label-left-align","cssCode":"","customClass":"","functions":"","layoutType":"PC","jsonVersion":3,"onFormCreated":"","onFormMounted":"","onFormDataChange":""}}
  
  const formJson = reactive(data)
  const formData = reactive({})
  const optionData = reactive({})
  const vFormRef = ref(null)
  
  const submitForm = () => {
   vFormRef.value.getFormData().then(formData => {
     // Form Validation OK
     alert( JSON.stringify(formData) )
   }).catch(error => {
     // Form Validation failed
     ElMessage.error(error)
   })
  }
  </script>