<template>
  <el-container style="padding: 40px; max-width: 1200px; margin: auto;">
    <el-header>
      <h2>Dynamic Table (Upload .xlsx)</h2>
      <el-upload
        class="upload-demo"
        drag
        :show-file-list="false"
        accept=".xlsx"
        :before-upload="handleFileUpload"
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">Drop xlsx file here or <em>click to upload</em></div>
      </el-upload>
    </el-header>
    <el-main v-if="tableData.length">
      <el-row :gutter="20" style="margin-bottom: 20px;">
        <el-col :span="6">
          <el-input v-model="searchId" placeholder="Search by ID" clearable @input="handleSearch" />
        </el-col>
        <el-col :span="6">
          <el-input-number v-model="filterValue" :min="0" placeholder="Filter value" style="width: 100%;" />
        </el-col>
        <el-col :span="6">
          <el-select v-model="filterType" placeholder="Filter type" style="width: 100%;">
            <el-option label=">=" value=">=" />
            <el-option label="<=" value="<=" />
            <el-option label=">" value=">" />
            <el-option label="<" value="<" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-select v-model="filterColumn" placeholder="Filter column" style="width: 100%;">
            <el-option v-for="col in numericColumns" :key="col" :label="col" :value="col" />
          </el-select>
        </el-col>
      </el-row>
      <el-table
        :data="paginatedData"
        style="width: 100%"
        @sort-change="handleSort"
      >
        <el-table-column
          v-for="col in columns"
          :key="col"
          :prop="col"
          :label="col"
          sortable
        />
      </el-table>
      <el-pagination
        style="margin-top: 20px; text-align: right;"
        background
        layout="sizes, prev, pager, next"
        :page-sizes="[10, 20, 50]"
        :page-size="pageSize"
        :current-page="currentPage"
        :total="filteredData.length"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </el-main>
  </el-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import * as XLSX from 'xlsx'

const tableData = ref([])
const columns = ref([])
const numericColumns = ref([])
const searchId = ref('')
const filterValue = ref()
const filterType = ref('')
const filterColumn = ref('')
const pageSize = ref(10)
const currentPage = ref(1)
const sortProp = ref('')
const sortOrder = ref('')

// 页面加载时自动读取 public/front-end-dynamic-table.xlsx 文件
onMounted(async () => {
  try {
    const response = await fetch('/front-end-dynamic-table.xlsx')
    const arrayBuffer = await response.arrayBuffer()
    const workbook = XLSX.read(arrayBuffer, { type: 'array' })
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
    const json = XLSX.utils.sheet_to_json(firstSheet)
    tableData.value = json
    columns.value = json.length ? Object.keys(json[0]) : []
    numericColumns.value = columns.value.filter(col => json.some(row => typeof row[col] === 'number'))
    currentPage.value = 1
  } catch (e) {
    tableData.value = []
    columns.value = []
    numericColumns.value = []
  }
})

function handleFileUpload(file) {
  const reader = new FileReader()
  reader.onload = (e) => {
    const data = new Uint8Array(e.target.result)
    const workbook = XLSX.read(data, { type: 'array' })
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
    const json = XLSX.utils.sheet_to_json(firstSheet)
    tableData.value = json
    columns.value = json.length ? Object.keys(json[0]) : []
    numericColumns.value = columns.value.filter(col => json.some(row => typeof row[col] === 'number'))
    currentPage.value = 1
  }
  reader.readAsArrayBuffer(file)
  return false
}

const filteredData = computed(() => {
  let data = tableData.value
  if (searchId.value) {
    data = data.filter(row => String(row.ID).includes(searchId.value))
  }
  if (filterColumn.value && filterType.value && filterValue.value !== undefined && filterValue.value !== null) {
    data = data.filter(row => {
      const val = row[filterColumn.value]
      if (typeof val !== 'number') return false
      switch (filterType.value) {
        case '>': return val > filterValue.value
        case '>=': return val >= filterValue.value
        case '<': return val < filterValue.value
        case '<=': return val <= filterValue.value
        default: return true
      }
    })
  }
  if (sortProp.value) {
    data = [...data].sort((a, b) => {
      if (sortOrder.value === 'ascending') return a[sortProp.value] > b[sortProp.value] ? 1 : -1
      if (sortOrder.value === 'descending') return a[sortProp.value] < b[sortProp.value] ? 1 : -1
      return 0
    })
  }
  return data
})

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredData.value.slice(start, start + pageSize.value)
})

function handleSort({ prop, order }) {
  sortProp.value = prop
  sortOrder.value = order
}
function handleSizeChange(size) {
  pageSize.value = size
  currentPage.value = 1
}
function handlePageChange(page) {
  currentPage.value = page
}
function handleSearch() {
  currentPage.value = 1
}
</script>

<style>
.upload-demo {
  margin-bottom: 20px;
}
</style> 