<template>
  <div>
    <template v-if="shouldMergeRow">
      <td :rowspan="getRowspan(rowIndex, columnIndex)">{{ mergedCellValue }}</td>
    </template>
    <template v-else>
      <td>{{ cellValue }}</td>
    </template>
  </div>
</template>

<script>
export default {
  props: {
    cellValue: {
      type: String,
      required: true
    },
    mergedCellValue: {
      type: String,
      required: true
    },
    rowIndex: {
      type: Number,
      required: true
    },
    columnIndex: {
      type: Number,
      required: true
    },
    shouldMergeRow: {
      type: Boolean,
      required: true
    },
    getRowspan: {
      type: Function,
      required: true
    }
  }
}
</script>
